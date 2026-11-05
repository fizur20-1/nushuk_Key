import { getNushukStats } from "../../server/db";

export default async function handler(_req: unknown, res: { status: (code: number) => { json: (value: unknown) => void } }) {
  res.status(200).json(await getNushukStats());
}
