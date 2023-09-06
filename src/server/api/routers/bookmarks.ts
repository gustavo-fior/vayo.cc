import { z } from "zod";
import { getBookmarkMetadata } from "~/helpers/getBookmarkMetadata";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const bookmarksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, faviconImage, ogImage } = await getBookmarkMetadata(
        input.url
      );

      return await ctx.prisma.bookmark.create({
        data: {
          url: input.url,
          title: title,
          favicon: faviconImage,
          ogImage: ogImage,
          userId: ctx.session.user.id,
        },
      });
    }),
  findByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.session?.user.id;

      return await ctx.prisma.bookmark.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
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
      return await ctx.prisma.bookmark.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
