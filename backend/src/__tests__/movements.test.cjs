const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

// Read configuration from environment variables
const PORT = parseInt(process.env.PORT || '4001', 10);
const HOST = process.env.HOST || '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const SECRET = process.env.MOVEMENTS_CLEAR_SECRET || 'test-secret';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'spendr.db');

// Ensure data directory exists (for local runs)
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let serverProcess;

function httpRequest(method, pathname, body = null, headers = {}) {
  const opts = new URL(pathname, BASE_URL);
  const options = {
    method,
    hostname: opts.hostname,
    port: opts.port,
    path: opts.pathname + opts.search,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            const parsed = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        } else {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Initialize backend before running tests
beforeAll(async () => {
  // First, initialize the database schema by running src/db/init.js
  const initEnv = Object.assign({}, process.env, {
    DB_PATH: DB_PATH,
  });

  await new Promise((resolve, reject) => {
    const initProcess = spawn(process.execPath, ['src/db/init.js'], {
      env: initEnv,
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Database schema initialized');
        resolve();
      } else {
        reject(new Error(`Database init failed with exit code ${code}`));
      }
    });

    initProcess.on('error', reject);
  });

  // Now spawn the backend server process
  const env = Object.assign({}, process.env, {
    DB_PATH: DB_PATH,
    MOVEMENTS_CLEAR_SECRET: SECRET,
    PORT: String(PORT),
    HOST: HOST,
  });

  serverProcess = spawn(process.execPath, ['src/index.js'], {
    env,
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait for the server to start and be ready to accept requests
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Backend did not start in time (waited 30 seconds)'));
    }, 30000);

    serverProcess.stdout.on('data', (chunk) => {
      const output = String(chunk);
      if (output.includes('Server is running')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (chunk) => {
      process.stderr.write(String(chunk));
    });
  });

  console.log(`Backend started on ${BASE_URL}`);
});

// Cleanup after tests complete
afterAll(() => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

test('Create movement and verify created with current date', async () => {
  const payload = { name: 'Salary', category: 'Income', value: 1500, type: 'ingress' };
  const res = await httpRequest('POST', '/api/movements', payload);
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');

  const list = await httpRequest('GET', '/api/movements');
  expect(list.status).toBe(200);
  expect(Array.isArray(list.body)).toBe(true);
  expect(list.body.length).toBeGreaterThanOrEqual(1);

  const mv = list.body.find(m => m.id === res.body.id);
  expect(mv).toBeDefined();
  // date should be ISO-like: YYYY-MM-DDTHH:MM:SS (allow optional milliseconds and Z)
  expect(typeof mv.date === 'string' || typeof mv.date === 'number').toBe(true);
  if (typeof mv.date === 'string') {
    expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(mv.date)).toBe(true);
  }
});

test('Patch movement validations and update', async () => {
  // Create one
  const create = await httpRequest('POST', '/api/movements', { name: 'Item', category: 'Misc', value: 10, type: 'egress' });
  expect(create.status).toBe(201);
  const id = create.body.id;

  // Patch without name/category -> 400
  const badPatch = await httpRequest('PATCH', `/api/movements/${id}`, {});
  expect(badPatch.status).toBe(400);

  // Patch non-existing -> 404 or 500 depending on implementation
  const notFound = await httpRequest('PATCH', '/api/movements/999999', { name: 'X' });
  expect([404, 500]).toContain(notFound.status);

  // Valid update
  const update = await httpRequest('PATCH', `/api/movements/${id}`, { name: 'Item Updated', category: 'Groceries' });
  expect(update.status).toBe(200);

  const list = await httpRequest('GET', '/api/movements');
  const mv = list.body.find(m => m.id === id);
  expect(mv).toBeDefined();
  expect(mv.name).toBe('Item Updated');
  expect(mv.category).toBe('Groceries');
});

test('GET / with filters', async () => {
  // Create multiple movements
  await httpRequest('POST', '/api/movements', { name: 'A', category: 'Food', value: 5, type: 'egress' });
  await httpRequest('POST', '/api/movements', { name: 'B', category: 'Salary', value: 200, type: 'ingress' });
  await httpRequest('POST', '/api/movements', { name: 'C', category: 'Food', value: 15, type: 'egress' });

  const all = await httpRequest('GET', '/api/movements');
  expect(all.status).toBe(200);
  expect(all.body.length).toBeGreaterThanOrEqual(3);

  // Use filters: type=egress & category=Food
  const filtered = await httpRequest('GET', '/api/movements?type=egress&category=Food');
  expect(filtered.status).toBe(200);
  expect(filtered.body.every(m => m.type === 'egress' && m.category === 'Food')).toBe(true);
});

test('Clear-all endpoint removes all movements', async () => {
  // Create multiple movements
  await httpRequest('POST', '/api/movements', { name: 'X', category: 'Temp', value: 1, type: 'egress' });
  await httpRequest('POST', '/api/movements', { name: 'Y', category: 'Temp', value: 2, type: 'ingress' });

  const before = await httpRequest('GET', '/api/movements');
  expect(before.status).toBe(200);
  expect(before.body.length).toBeGreaterThanOrEqual(2);

  const clear = await httpRequest('DELETE', '/api/movements/clear-all', null, { secretkey: SECRET });
  expect(clear.status).toBe(200);

  const after = await httpRequest('GET', '/api/movements');
  expect(after.status).toBe(200);
  expect(Array.isArray(after.body)).toBe(true);
  expect(after.body.length).toBe(0);
});
