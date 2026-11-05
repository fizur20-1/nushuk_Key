import { nanoid } from "nanoid";

type RegistryItem = { id: number; key: string; createdAt: string; publicRef: string };

const globalStore = globalThis as typeof globalThis & { __nushukRegistry?: RegistryItem[]; __nushukRegistryId?: number };
const registry = globalStore.__nushukRegistry ?? (globalStore.__nushukRegistry = []);
if (!globalStore.__nushukRegistryId) globalStore.__nushukRegistryId = 1;

export default function handler(
  req: { method?: string; query?: Record<string, unknown>; body?: { key?: unknown } },
  res: { status: (code: number) => { json: (value: unknown) => void } },
) {
  const operation = typeof req.query?.operation === "string" ? req.query.operation : "stats";

  if (operation === "stats") {
    res.status(200).json({ total: registry.length, latest: registry[0] ? `••••-${registry[0].key.replace(/\s+/g, "").slice(-4)}` : null });
    return;
  }

  if (operation === "recent") {
    const page = Math.max(1, Number(req.query?.page ?? 1) || 1);
    const pageSize = Math.min(20, Math.max(1, Number(req.query?.pageSize ?? 5) || 5));
    const totalPages = registry.length === 0 ? 0 : Math.ceil(registry.length / pageSize);
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    res.status(200).json({
      items: registry.slice(start, start + pageSize).map(item => ({ id: item.id, key: item.key, createdAt: item.createdAt })),
      page: safePage,
      pageSize,
      total: registry.length,
      totalPages,
    });
    return;
  }

  if (operation === "add" && req.method === "POST") {
    const rawKey = typeof req.body?.key === "string" ? req.body.key.trim() : "";
    if (rawKey.length < 4 || rawKey.length > 160 || !/^[A-Za-z0-9][A-Za-z0-9 ._\-/]*$/.test(rawKey)) {
      res.status(400).json({ message: "Use 4–160 characters: letters, numbers, spaces, dots, dashes, or slashes." });
      return;
    }
    const normalizedKey = rawKey.replace(/\s+/g, " ").toUpperCase();
    if (registry.some(item => item.key === normalizedKey)) {
      res.status(409).json({ message: "That key is already in the collection. Thank you for checking." });
      return;
    }
    registry.unshift({ id: globalStore.__nushukRegistryId++, key: normalizedKey, createdAt: new Date().toISOString(), publicRef: `NK-${nanoid(10).toUpperCase()}` });
    res.status(200).json({ success: true, maskedKey: `••••-${normalizedKey.replace(/\s+/g, "").slice(-4)}` });
    return;
  }

  res.status(404).json({ message: "Registry operation not found." });
}
