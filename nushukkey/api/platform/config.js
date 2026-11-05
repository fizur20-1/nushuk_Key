import { publicPlatformScript } from "../../../server/_core/publicConfig.ts";

export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/javascript");
  res.status(200).send(publicPlatformScript());
}
