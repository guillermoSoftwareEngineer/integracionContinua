import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Prefer DB_PATH from environment (set in docker-compose). Default to the shared /data volume path used by the containers.
const dbPath = process.env.DB_PATH || join(__dirname, '../../data/spendr.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
// Export the raw better-sqlite3 instance for direct SQL queries when needed
export const sqliteDb = sqlite;
// Diagnostic log so container logs show which DB path is being opened and whether file exists
import fs from 'fs';
try {
	const exists = fs.existsSync(dbPath);
	console.log('Database opened at', dbPath, 'exists=', exists);
} catch (err) {
	console.error('Error checking DB path', dbPath, err);
}