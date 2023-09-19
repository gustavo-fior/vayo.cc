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
        folderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, faviconUrl, ogImageUrl } = await getBookmarkMetadata(
        input.url
      );

      await ctx.prisma.folder.update({
        where: {
          id: input.folderId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return await ctx.prisma.bookmark.create({
        data: {
          url: input.url,
          title: title,
          faviconUrl: faviconUrl,
          ogImageUrl: ogImageUrl,
          folderId: input.folderId,
        },
      });
    }),
  findByFolderId: publicProcedure
    .input(
      z.object({
        folderId: z.string(),
        direction: z.enum(["asc", "desc"]),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.bookmark.findMany({
        where: {
          folderId: input.folderId,
        },
        orderBy: {
          createdAt: input.direction,
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
