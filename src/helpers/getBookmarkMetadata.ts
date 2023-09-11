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

    const canonicalElement = document.querySelector("link[rel='canonical']");
    const canonicalUrl: string | null = canonicalElement?.getAttribute("href");

    const ogImageElement = document.querySelector("meta[property='og:image']");
    const ogImageUrl: string | null = ogImageElement?.getAttribute("content");

    const faviconElement = document.querySelector("link[rel='icon']");
    const appleTouchIconElement = document.querySelector("link[rel='apple-touch-icon']");

    console.log("appleTouchIconElement", appleTouchIconElement);

    const faviconUrl: string | null = appleTouchIconElement ? appleTouchIconElement.getAttribute("href") : faviconElement?.getAttribute("href");

    console.log("faviconUrl", faviconUrl);

    // Use Promise.all to parallelize requests
    const [faviconImageData, ogImageImageData] = await Promise.all([
      canonicalUrl && faviconUrl
        ? fetchAndEncodeImageData(new URL(faviconUrl, canonicalUrl).href)
        : null,
      ogImageUrl
        ? fetchAndEncodeImageData(new URL(ogImageUrl, url).href)
        : null,
    ]);

    return {
      title,
      faviconImage: faviconImageData
        ? `data:image/png;base64,${faviconImageData}`
        : undefined,
      ogImage: ogImageImageData
        ? `data:image/png;base64,${ogImageImageData}`
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching page metadata:", error);
    return { title: "", faviconImage: undefined, ogImage: undefined };
  }
};

const fetchAndEncodeImageData = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Your User Agent", // Add a User-Agent header for web scraping
      },
      referrerPolicy: "no-referrer",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const imageData = await response.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(imageData).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    return base64Data;
  } catch (error) {
    console.error(`Error fetching image data from ${url}:`, error);
    return null;
  }
};

export type BookmarkMetadata = {
  title: string;
  faviconImage: string | undefined;
  ogImage: string | undefined;
};
