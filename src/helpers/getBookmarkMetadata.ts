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

    let ogImageElement = document.querySelector("meta[property='og:image']");

    if (!ogImageElement) {
      ogImageElement = document.querySelector("meta[name='og:image']");
    }

    let ogImageUrl: string | null = ogImageElement?.getAttribute("content");

    if (!ogImageUrl) {
      const twitterImageElement = document.querySelector(
        "meta[name='twitter:image']"
      );
      const twitterImageUrl: string | null =
        twitterImageElement?.getAttribute("content");

      if (twitterImageUrl) {
        const twitterImageResponse = await fetch(
          new URL(twitterImageUrl, url).href
        );

        if (twitterImageResponse.ok) ogImageUrl = twitterImageUrl;
      }
    }

    if (!ogImageUrl) {
      const imageElement = document.querySelector("img");

      if (imageElement) {
        const imageResponse = await fetch(
          new URL((imageElement.getAttribute("src") as string) ?? "", url).href
        );

        if (imageResponse.ok) ogImageUrl = imageElement.getAttribute("src");
      }
    }

    let faviconUrl: string | null = null;

    const faviconElement: HTMLElement =
      document.querySelector("link[rel='icon']");
    const appleTouchIconElement: HTMLElement = document.querySelector(
      "link[rel='apple-touch-icon']"
    );
    const shortcutIconElement: HTMLElement = document.querySelector(
      "link[rel='shortcut icon']"
    );

    // First try to get the apple touch icon
    if (appleTouchIconElement) {
      const appleTouchIconResponse = await fetch(
        new URL(appleTouchIconElement.getAttribute("href") ?? "", url).href
      );

      if (appleTouchIconResponse.ok)
        faviconUrl = appleTouchIconElement.getAttribute("href");
    }

    if (faviconElement && !faviconUrl) {
      const faviconResponse = await fetch(
        new URL(faviconElement.getAttribute("href") ?? "", url).href
      );

      if (faviconResponse.ok) faviconUrl = faviconElement.getAttribute("href");
    }

    if (shortcutIconElement && !faviconUrl) {
      const shortcutIcon = await fetch(
        new URL(shortcutIconElement.getAttribute("href") ?? "", url).href
      );

      if (shortcutIcon.ok)
        faviconUrl = shortcutIconElement.getAttribute("href");
    }

    if (!faviconUrl) {
      faviconUrl = new URL("/favicon.ico", url).href;
    }

    return {
      title,
      faviconUrl: new URL(faviconUrl, url).toString(),
      ogImageUrl,
    };
  } catch (error) {
    console.error("Error fetching page metadata:", error);
    return {
      title: "",
      faviconUrl: null,
      ogImageUrl: null,
    };
  }
};

export type BookmarkMetadata = {
  title: string;
  faviconUrl: string | null;
  ogImageUrl: string | null;
};
