import { JSDOM } from "jsdom";
import ky from "ky";
import { z } from "zod";
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

export type BookmarkMetadata = {
  title: string;
  faviconImage: string | undefined;
  ogImage: string | undefined;
};

const getBookmarkMetadata = async (url: string): Promise<BookmarkMetadata> => {
  let faviconImage: string | undefined;
  let ogImage: string | undefined;

  const response = await ky.get(url);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.querySelector("title")?.textContent ?? "";

  const faviconElement = document.querySelector("link[rel='icon']");
  const favicon = faviconElement?.getAttribute("href");

  const ogImageElement = document.querySelector("meta[property='og:image']");
  const ogImageUrl = ogImageElement?.getAttribute("content");

  if (favicon) {
    // Fetch the favicon image link or data here
    try {
      const faviconResponse = await ky.get(new URL(favicon, url).href);
      // Assuming you want to store the image data
      const faviconImageData = await faviconResponse.arrayBuffer();
      const faviconBase64 = Buffer.from(faviconImageData).toString("base64");
      faviconImage = `data:image/png;base64,${faviconBase64}`;
    } catch (error) {
      console.error("Error fetching favicon:", error);
    }
  }

  if (ogImageUrl) {
    try {
      const ogImageResponse = await ky.get(new URL(ogImageUrl, url).href);
      // Assuming you want to store the image data
      const ogImageImageData = await ogImageResponse.arrayBuffer();
      const ogImageBase64 = Buffer.from(ogImageImageData).toString("base64");
      ogImage = `data:image/png;base64,${ogImageBase64}`;
    } catch (error) {
      console.error("Error fetching favicon:", error);
    }
  }

  return { title, faviconImage, ogImage };
};
