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
      const folder = await ctx.prisma.folder.findUnique({
        where: {
          id: input.folderId,
        },
      });

      if (!folder?.allowDuplicate) {
        const existingBookmark = await ctx.prisma.bookmark.findFirst({
          where: {
            url: input.url,
            folderId: input.folderId,
          },
        });

        if (existingBookmark) {
          return Error("Bookmark already exists");
        }
      }

      const { title, faviconUrl, ogImageUrl } = await getBookmarkMetadata(
        input.url
      );

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
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.bookmark.findMany({
        where: {
          folderId: input.folderId,
        },
        orderBy: {
          createdAt: "desc"
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
