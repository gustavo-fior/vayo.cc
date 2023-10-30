import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        lastViewStyle: z.string(),
        lastDirection: z.string(),
        lastShowMonths: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          lastViewStyle: input.lastViewStyle,
          lastDirection: input.lastDirection,
          lastShowMonths: input.lastShowMonths,
        },
      });
    }),
});
