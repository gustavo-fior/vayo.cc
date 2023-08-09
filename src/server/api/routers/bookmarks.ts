import ky from "ky";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { JSDOM } from "jsdom";

export const bookmarksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, faviconImage } = await getBookmarkMetadata(input.url);

      return await ctx.prisma.bookmark.create({
        data: {
          url: input.url,
          title: title,
          favicon: faviconImage,
          userId: ctx.session.user.id,
        },
      });
    }),
  findByUserId: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.bookmark.findMany({
      where: {
        userId: ctx.session.user.id,
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
    }
  ),
});

export type BookmarkMetadata = {
  title: string;
  faviconImage: string;
};

const getBookmarkMetadata = async (url: string): Promise<BookmarkMetadata> => {
  const response = await ky.get(url);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.querySelector("title")?.textContent ?? "";

  const faviconElement = document.querySelector("link[rel='icon']");
  const favicon = faviconElement?.getAttribute("href");

  let faviconImage: string | undefined;

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

  console.log("Favicon:", favicon);
  console.log("Favicon image:", faviconImage);


  return { title, faviconImage };
};
