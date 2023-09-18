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

    let favicon: string | null = null;

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
        favicon = appleTouchIconElement.getAttribute("href");
    }

    if (faviconElement && !favicon) {
      const faviconResponse = await fetch(
        new URL(faviconElement.getAttribute("href") ?? "", url).href
      );

      if (faviconResponse.ok) favicon = faviconElement.getAttribute("href");
    }

    if (shortcutIconElement && !favicon) {
      const shortcutIcon = await fetch(
        new URL(shortcutIconElement.getAttribute("href") ?? "", url).href
      );

      if (shortcutIcon.ok) favicon = shortcutIconElement.getAttribute("href");
    }

    if (!favicon) {
      favicon = new URL("/favicon.ico", url).href;
    }

    let faviconImage: string | undefined = undefined;
    let ogImage: string | undefined = undefined;

    if (favicon) {
      // Fetch the favicon image link or data here
      try {
        const faviconResponse = await fetch(new URL(favicon, url).href);

        if (!faviconResponse.ok) {
          throw new Error(
            `Failed to fetch: ${faviconResponse.status} ${faviconResponse.statusText}`
          );
        }

        if (favicon.endsWith(".svg")) {

          const faviconData = await faviconResponse.text();

          faviconImage = `data:image/svg+xml;base64,${btoa(faviconData)}`;
        } else {
          const faviconImageData = await faviconResponse.arrayBuffer();

          const faviconBase64 = btoa(
            new Uint8Array(faviconImageData).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          faviconImage = `data:image/png;base64,${faviconBase64}`;
        }
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
