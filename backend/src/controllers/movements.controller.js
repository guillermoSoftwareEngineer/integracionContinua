import { eq, desc, gte, lte } from 'drizzle-orm';
import { db, sqliteDb } from '../db/database.js';
import { movements } from '../db/schema.js';

// Create a new movement
export async function createMovement(req, res) {
  const { name, category, value, type } = req.body;

  if (!name || !category || value == null || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['ingress', 'egress'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either ingress or egress' });
  }

  try {
    const currentDate = new Date().toISOString();
    const result = await db.insert(movements).values({
      name,
      category,
      value,
      type,
      date: currentDate,
      createdAt: currentDate,
    }).returning({ id: movements.id });

    res.status(201).json({ id: result[0].id });
  } catch (error) {
    console.error('Create movement error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Update movement (only name and category)
export async function updateMovement(req, res) {
  const { id } = req.params;
  const { name, category } = req.body;

  if (!name && !category) {
    return res.status(400).json({ error: 'Either name or category must be provided' });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (category) updateData.category = category;

  try {
    const result = await db.update(movements)
      .set(updateData)
      .where(eq(movements.id, parseInt(id)))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Movement not found' });
    }
    res.json({ message: 'Movement updated successfully' });
  } catch (error) {
    console.error('Update movement error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all movements with filters
export async function getMovements(req, res) {
  const { type, category, startDate, endDate } = req.query;

  try {
    let query = db.select().from(movements);

    if (type) {
      query = query.where(eq(movements.type, type));
    }
    if (category) {
      query = query.where(eq(movements.category, category));
    }
    if (startDate) {
      const s = new Date(startDate).toISOString().slice(0, 19);
      query = query.where(gte(movements.date, s));
    }
    if (endDate) {
      const e = new Date(endDate).toISOString().slice(0, 19);
      query = query.where(lte(movements.date, e));
    }

    const rows = await query.orderBy(desc(movements.date));
    res.json(rows);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get financial summary for dashboard
export async function getSummary(req, res) {
  try {
    const row = sqliteDb.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'ingress' THEN value ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'egress' THEN value ELSE 0 END) as total_expenses,
        (SUM(CASE WHEN type = 'ingress' THEN value ELSE 0 END) - SUM(CASE WHEN type = 'egress' THEN value ELSE 0 END)) as balance
      FROM movements;
    `).get();

    res.json({
      total_income: row.total_income || 0,
      total_expenses: row.total_expenses || 0,
      balance: row.balance || 0,
    });
  } catch (error) {
    console.error('Summary endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Hidden endpoint to clear all movements (requires secret key)
export async function clearAll(req, res) {
  const secretKey = req.headers['secretkey'] || req.headers['secret-key'] || req.headers['secret_key'];

  if (secretKey !== process.env.MOVEMENTS_CLEAR_SECRET) {
    return res.status(403).json({ error: 'Unauthorized: Invalid secret key' });
  }

  try {
    sqliteDb.exec('DELETE FROM movements;');
    sqliteDb.exec("DELETE FROM sqlite_sequence WHERE name='movements';");
    res.json({ message: 'All movements have been cleared successfully' });
  } catch (error) {
    console.error('Clear-all error:', error);
    res.status(500).json({ error: error.message });
  }
}
