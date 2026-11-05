import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { publicPlatformScript } from "./_core/publicConfig";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  const sendHealth = (_req: express.Request, res: express.Response) => res.json({ status: "ok" });
  const sendPlatformConfig = (_req: express.Request, res: express.Response) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  };
  app.get("/health", sendHealth);
  app.get("/api/health", sendHealth);
  app.get("/platform/config.js", sendPlatformConfig);
  app.get("/api/platform/config.js", sendPlatformConfig);
  registerOAuthRoutes(app);
  const trpcMiddleware = createExpressMiddleware({ router: appRouter, createContext });
  app.use("/trpc", trpcMiddleware);
  app.use("/api/trpc", trpcMiddleware);

  return app;
}
