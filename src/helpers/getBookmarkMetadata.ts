/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { URL } from "url";

export const getBookmarkMetadata = async (
  url: string
): Promise<BookmarkMetadata> => {
  let faviconImage: string | undefined;
  let ogImage: string | undefined;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Check if the code is running on the server-side
    if (typeof window === "undefined") {
      const { JSDOM } = require("jsdom"); // Only load jsdom on the server-side
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const title = document.querySelector("title")?.textContent ?? "";

      const faviconElement = document.querySelector("link[rel='icon']");
      const favicon: string = faviconElement?.getAttribute("href");

      const ogImageElement = document.querySelector(
        "meta[property='og:image']"
      );
      const ogImageUrl: string = ogImageElement?.getAttribute("content");

      if (favicon) {
        // Fetch the favicon image link or data here
        try {
          const faviconResponse = await fetch(new URL(favicon, url).href);
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
    } else {
      // Client-side code (browser)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent ?? "";

      const faviconElement = doc.querySelector("link[rel='icon']");
      const favicon = faviconElement?.getAttribute("href");

      const ogImageElement = doc.querySelector("meta[property='og:image']");
      const ogImageUrl = ogImageElement?.getAttribute("content");

      if (favicon) {
        // Fetch the favicon image link or data here
        try {
          const faviconResponse = await fetch(new URL(favicon, url).href);
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
    }
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
