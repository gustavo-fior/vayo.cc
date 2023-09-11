import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const foldersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        icon: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.folder.create({
        data: {
          name: input.name,
          icon: input.icon ?? undefined,
          userId: ctx.session.user.id,
        },
      });
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.session.user.id;

      return await ctx.prisma.folder.findMany({
        where: {
          userId: userId,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.folder.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
