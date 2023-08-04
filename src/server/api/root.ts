import { createTRPCRouter } from "~/server/api/trpc";
import { bookmarksRouter } from "./routers/bookmarks";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bookmarks: bookmarksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
