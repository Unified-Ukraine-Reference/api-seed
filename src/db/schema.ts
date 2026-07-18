import {
  pgTable,
  varchar,
  smallint,
  text,
  timestamp,
  type AnyPgColumn,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const locationTypes = pgTable('location_types', {
  code: varchar('code', { length: 1 }).notNull().primaryKey(),
  level: smallint('level'),
  nameUa: text('name_ua').notNull(),
  nameEn: text('name_en').notNull(),
});

export const locations = pgTable(
  'locations',
  {
    code: varchar('code', { length: 19 }).notNull().primaryKey(),
    nameUa: text('name_ua').notNull(),
    nameEn: text('name_en').notNull(),
    categoryCode: varchar('category_code', { length: 1 })
      .notNull()
      .references(() => locationTypes.code),
    parentCode: varchar('parent_code', { length: 19 }).references(
      (): AnyPgColumn => locations.code,
      {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('locations_parent_idx').on(table.parentCode),
    index('locations_category_idx').on(table.categoryCode),
  ]
);

export const locationsRelations = relations(locations, ({ one, many }) => ({
  category: one(locationTypes, {
    fields: [locations.categoryCode],
    references: [locationTypes.code],
  }),

  parent: one(locations, {
    fields: [locations.parentCode],
    references: [locations.code],
    relationName: 'locationHierarchy',
  }),

  children: many(locations, {
    relationName: 'locationHierarchy',
  }),
}));

export const locationTypesRelations = relations(locationTypes, ({ many }) => ({
  locations: many(locations),
}));

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type LocationType = typeof locationTypes.$inferSelect;
export type NewLocationType = typeof locationTypes.$inferInsert;
