import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const movements = sqliteTable('movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  value: real('value').notNull(),
  type: text('type', { enum: ['ingress', 'egress'] }).notNull(),
  date: text('date').notNull().$defaultFn(() => {
    return new Date().getTime()  // Format: YYYY-MM-DDTHH:mm:ss
  }),
  createdAt: text('created_at').notNull().$defaultFn(() => {
    return new Date().getTime()
  })
});