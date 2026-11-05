import { getNushukKeysPage } from "../../server/db";

export default async function handler(req: { query?: Record<string, unknown> }, res: { status: (code: number) => { json: (value: unknown) => void } }) {
  const page = Math.max(1, Number(req.query?.page ?? 1) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(req.query?.pageSize ?? 5) || 5));
  res.status(200).json(await getNushukKeysPage(page, pageSize));
}
