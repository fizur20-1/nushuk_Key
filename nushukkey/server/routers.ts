import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addNushukKey, getNushukKeysPage, getNushukStats } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";

const keyInput = z
  .string()
  .trim()
  .min(4, "Enter at least 4 characters.")
  .max(160, "Keys must be 160 characters or fewer.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9 ._\-/]*$/, "Use letters, numbers, spaces, dots, dashes, or slashes.")
  .transform(value => value.replace(/\s+/g, " ").toUpperCase());

const isDuplicateError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "ER_DUP_ENTRY" || candidate.message?.toLowerCase().includes("duplicate entry");
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  registry: router({
    stats: publicProcedure.query(() => getNushukStats()),
    recent: publicProcedure
      .input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(20).default(5) }).optional())
      .query(({ input }) => getNushukKeysPage(input?.page ?? 1, input?.pageSize ?? 5)),
    add: publicProcedure.input(z.object({ key: keyInput })).mutation(async ({ input }) => {
      const publicRef = `NK-${nanoid(10).toUpperCase()}`;
      try {
        await addNushukKey(input.key, publicRef);
        return { success: true as const, maskedKey: `••••-${input.key.replace(/\s+/g, "").slice(-4)}` };
      } catch (error) {
        if (isDuplicateError(error)) {
          throw new TRPCError({ code: "CONFLICT", message: "That key is already in the collection. Thank you for checking." });
        }
        console.error("[Registry] Failed to add Nushuk key:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The registry is taking a breath. Please try again." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
