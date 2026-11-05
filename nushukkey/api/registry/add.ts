import { nanoid } from "nanoid";
import { addNushukKey } from "../../server/db";

export default async function handler(req: { body?: { key?: unknown } }, res: { status: (code: number) => { json: (value: unknown) => void } }) {
  const rawKey = typeof req.body?.key === "string" ? req.body.key.trim() : "";
  if (rawKey.length < 4 || rawKey.length > 160 || !/^[A-Za-z0-9][A-Za-z0-9 ._\-/]*$/.test(rawKey)) {
    res.status(400).json({ message: "Use 4–160 characters: letters, numbers, spaces, dots, dashes, or slashes." });
    return;
  }

  const normalizedKey = rawKey.replace(/\s+/g, " ").toUpperCase();
  try {
    await addNushukKey(normalizedKey, `NK-${nanoid(10).toUpperCase()}`);
    res.status(200).json({ success: true, maskedKey: `••••-${normalizedKey.replace(/\s+/g, "").slice(-4)}` });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ message: "That key is already in the collection. Thank you for checking." });
      return;
    }
    console.error("[Registry] Failed to add Nushuk key:", error);
    res.status(500).json({ message: "The registry is taking a breath. Please try again." });
  }
}
