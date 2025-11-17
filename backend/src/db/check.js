import Database from 'better-sqlite3';

const dbPath = '/app/data/spendr.db';
try {
  const db = new Database(dbPath, { readonly: true });
  const tables = db.prepare("SELECT name, type, sql FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in', dbPath, JSON.stringify(tables, null, 2));
  db.close();
  process.exit(0);
} catch (err) {
  console.error('Error opening DB:', err);
  process.exit(1);
}
