import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  findByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.session?.user.id;

      return await ctx.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
    }),
  updateLastFolderId: protectedProcedure
    .input(
      z.object({
        lastFolderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;

      return await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          lastFolderId: input.lastFolderId,
        },
      });
    }),
});
