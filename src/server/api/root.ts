import { projectRouter } from "@/server/api/routers/project";
import { apiRouter } from "@/server/api/routers/api";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  api: apiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.project.getAll();
 *       ^? Project[]
 */
export const createCaller = createCallerFactory(appRouter);
