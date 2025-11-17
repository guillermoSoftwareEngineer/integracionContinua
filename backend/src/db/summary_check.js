import Database from 'better-sqlite3';

const dbPath = '/app/data/spendr.db';
try {
  const db = new Database(dbPath, { readonly: true });
  const row = db.prepare(`SELECT 
    SUM(CASE WHEN type='ingress' THEN value ELSE 0 END) as total_income,
    SUM(CASE WHEN type='egress' THEN value ELSE 0 END) as total_expenses,
    (SUM(CASE WHEN type='ingress' THEN value ELSE 0 END) - SUM(CASE WHEN type='egress' THEN value ELSE 0 END)) as balance
  FROM movements;`).get();
  console.log('Summary:', row);
  db.close();
  process.exit(0);
} catch (err) {
  console.error('Error running summary query:', err);
  process.exit(1);
}
