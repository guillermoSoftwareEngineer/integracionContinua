import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || join(__dirname, '../../data/spendr.db');

// Initialize database using better-sqlite3 directly
const sqlite = new Database(dbPath);

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    value REAL NOT NULL,
    type TEXT CHECK(type IN ('ingress', 'egress')) NOT NULL,
    date TEXT DEFAULT (datetime('now','localtime')),
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`;

try {
  sqlite.exec(createTableSQL);
  console.log('Database initialized successfully at', dbPath);
  process.exit(0);
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}