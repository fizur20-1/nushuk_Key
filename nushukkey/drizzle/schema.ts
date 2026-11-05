import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A public registry of normalized Nushuk keys.
 * The unique index is the source of truth for duplicate prevention.
 */
export const nushukKeys = mysqlTable(
  "nushukKeys",
  {
    id: int("id").autoincrement().primaryKey(),
    normalizedKey: varchar("normalizedKey", { length: 160 }).notNull(),
    publicRef: varchar("publicRef", { length: 18 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    normalizedKeyUnique: uniqueIndex("nushukKeys_normalizedKey_unique").on(table.normalizedKey),
  }),
);

export type NushukKey = typeof nushukKeys.$inferSelect;
export type InsertNushukKey = typeof nushukKeys.$inferInsert;
