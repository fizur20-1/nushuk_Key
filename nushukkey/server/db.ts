import { count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, nushukKeys, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

type LocalNushukKey = {
  id: number;
  normalizedKey: string;
  publicRef: string;
  createdAt: Date;
};

// Keeps the registry usable in local development when no MySQL connection is configured.
// Production deployments should provide DATABASE_URL so the registry is durable.
const localNushukKeys: LocalNushukKey[] = [];
let nextLocalNushukKeyId = 1;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addNushukKey(normalizedKey: string, publicRef: string) {
  const db = await getDb();
  if (!db) {
    if (localNushukKeys.some(key => key.normalizedKey === normalizedKey)) {
      const duplicateError = new Error("Duplicate key");
      Object.assign(duplicateError, { code: "ER_DUP_ENTRY" });
      throw duplicateError;
    }
    localNushukKeys.unshift({ id: nextLocalNushukKeyId++, normalizedKey, publicRef, createdAt: new Date() });
    return;
  }
  await db.insert(nushukKeys).values({ normalizedKey, publicRef });
}

export async function getNushukStats() {
  const db = await getDb();
  if (!db) {
    return {
      total: localNushukKeys.length,
      latest: localNushukKeys[0] ? maskKey(localNushukKeys[0].normalizedKey) : null,
    };
  }

  const [totalRow] = await db.select({ value: count(nushukKeys.id) }).from(nushukKeys);
  const [latestRow] = await db
    .select({ normalizedKey: nushukKeys.normalizedKey })
    .from(nushukKeys)
    .orderBy(desc(nushukKeys.createdAt))
    .limit(1);

  return {
    total: Number(totalRow?.value ?? 0),
    latest: latestRow ? maskKey(latestRow.normalizedKey) : null,
  };
}

export async function getNushukKeysPage(page = 1, pageSize = 5) {
  const db = await getDb();
  if (!db) {
    const total = localNushukKeys.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const safePage = totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      items: localNushukKeys.slice(start, start + pageSize).map(row => ({
        id: row.id,
        key: row.normalizedKey,
        createdAt: row.createdAt,
      })),
      page: safePage,
      pageSize,
      total,
      totalPages,
    };
  }

  const [totalRow] = await db.select({ value: count(nushukKeys.id) }).from(nushukKeys);
  const total = Number(totalRow?.value ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);

  const rows = await db
    .select({ id: nushukKeys.id, normalizedKey: nushukKeys.normalizedKey, createdAt: nushukKeys.createdAt })
    .from(nushukKeys)
    .orderBy(desc(nushukKeys.createdAt))
    .limit(pageSize)
    .offset((safePage - 1) * pageSize);

  return {
    items: rows.map(row => ({ id: row.id, key: row.normalizedKey, createdAt: row.createdAt })),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function maskKey(value: string) {
  const compact = value.replace(/\s+/g, "");
  if (compact.length <= 4) return `••••${compact}`;
  return `••••-${compact.slice(-4)}`;
}
