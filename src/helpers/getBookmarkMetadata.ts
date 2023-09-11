/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { URL } from "url";

export const getBookmarkMetadata = async (
  url: string
): Promise<BookmarkMetadata> => {
  try {
    const response = await fetch(url, {
      referrerPolicy: "no-referrer",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title = document.querySelector("title")?.textContent ?? "";

    const ogImageElement = document.querySelector("meta[property='og:image']");
    const ogImageUrl: string | null = ogImageElement?.getAttribute("content");

    const faviconElement = document.querySelector("link[rel='icon']");
    const appleTouchIconElement = document.querySelector(
      "link[rel='apple-touch-icon']"
    );

    const faviconUrl: string | null = appleTouchIconElement
      ? appleTouchIconElement.getAttribute("href")
      : faviconElement?.getAttribute("href");

    let faviconImage: string | undefined = undefined;
    let ogImage: string | undefined = undefined;

    if (faviconUrl) {
      // Fetch the favicon image link or data here
      try {
        const faviconResponse = await fetch(new URL(faviconUrl, url).href);
        const faviconImageData = await faviconResponse.arrayBuffer();
        const faviconBase64 = btoa(
          new Uint8Array(faviconImageData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        faviconImage = `data:image/png;base64,${faviconBase64}`;
      } catch (error) {
        console.error("Error fetching favicon:", error);
      }
    }

    if (ogImageUrl) {
      try {
        const ogImageResponse = await fetch(new URL(ogImageUrl, url).href);
        const ogImageImageData = await ogImageResponse.arrayBuffer();
        const ogImageBase64 = btoa(
          new Uint8Array(ogImageImageData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        ogImage = `data:image/png;base64,${ogImageBase64}`;
      } catch (error) {
        console.error("Error fetching favicon:", error);
      }
    }

    return { title, faviconImage, ogImage };
  } catch (error) {
    console.error("Error fetching page metadata:", error);
    return { title: "", faviconImage: undefined, ogImage: undefined };
  }
};

export type BookmarkMetadata = {
  title: string;
  faviconImage: string | undefined;
  ogImage: string | undefined;
};
