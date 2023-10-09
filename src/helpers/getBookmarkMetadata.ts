/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { URL } from "url";
import fetch, { type RequestInit } from "node-fetch";

export const getBookmarkMetadata = async (
  url: string,
  options?: RequestInit
): Promise<BookmarkMetadata> => {
  try {
    
    const response = await fetch(url, options ?? {
      redirect: "manual",
      headers: {
        "mode": "same-origin",
      },
    });

    console.log("response: " + response.status);

    // If the response is a redirect, fetch the redirect URL
    if (response.status >= 300 && response.status < 400) {
      console.log("redirecting to : " + response.headers.get("location"));

      const originalUrl = new URL(url);
      // get host and path
      const redirectUrl = new URL(
        response.headers.get("location") ?? "",
        originalUrl.origin
      ).href;

      if (!redirectUrl) {
        throw new Error("Redirect location header missing");
      }

      return getBookmarkMetadata(redirectUrl, {
        headers: {
          "Cookie": "guest_id=a;",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/92.0.4515.159 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
      });
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    console.log("html: " + html);

    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title = document.querySelector("title")?.textContent ?? document.querySelector("meta[property='og:title']").getAttribute("content") ?? "";

    console.log("title: " + title);

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
