/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fetch, { type RequestInit } from "node-fetch";
import { URL } from "url";
import { capitalizeFirstLetter } from "./capitalizeFirstLetter";
import { getCommonFavicons } from "./getCommonFavicons";

export const getBookmarkMetadata = async (
  url: string,
  options?: RequestInit
): Promise<BookmarkMetadata> => {
  try {
    const response = await fetch(
      url,
      options ?? {
        redirect: "manual",
        headers: {
          mode: "same-origin",
          Cookie:
            "guest_id=v1%3A169688089407904299; guest_id_ads=v1%3A169688089407904299; guest_id_marketing=v1%3A169688089407904299;",
        },
      }
    );

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

      return getBookmarkMetadata(redirectUrl, requestOptions);
    }

    if (response.status >= 400) {
      console.log("error: " + response.status);

      const metadata = await getMetadataThroughLib(url);

      const title = metadata.pageTitle ?? "";
      const ogImageUrl = metadata.image ?? "";
      const faviconUrl = metadata.logo ?? "";

      console.log("title: " + title);
      console.log("ogImageUrl: " + ogImageUrl);
      console.log("faviconUrl: " + faviconUrl);
      console.log(metadata);

      return {
        title,
        faviconUrl,
        ogImageUrl,
      };
    }

    const html = await response.text();

    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document: Document = dom.window.document;

    let title = await getTitle(url, document);
    let ogImageUrl = await getOgImageUrl(url, document);
    let faviconUrl = null;

    faviconUrl = getCommonFavicons(url);

    if (!faviconUrl) {
      faviconUrl = await getFaviconUrl(url, document);
    }

    if (!faviconUrl || !title || !ogImageUrl) {
      const { logo, image, pageTitle } = await getMetadataThroughLib(url);

      if (!faviconUrl) {
        faviconUrl = logo;
      }

      if (!ogImageUrl) {
        ogImageUrl = image;
      }

      if (!title) {
        title = pageTitle ?? "";
      }
    }

    return {
      title,
      faviconUrl,
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

export type Metadata = {
  pageTitle: string | null;
  logo: string | null;
  image: string | null;
};

// tries to get the favicon url from the given url, if it fails, it tries to get the favicon url from the root url
const getFaviconUrl = async (
  url: string,
  document: Document
): Promise<string | null> => {
  const faviconElement: HTMLElement | null =
    document.querySelector("link[rel='icon']");
  const appleTouchIconElement: HTMLElement | null = document.querySelector(
    "link[rel='apple-touch-icon']"
  );
  const shortcutIconElement: HTMLElement | null = document.querySelector(
    "link[rel='shortcut icon']"
  );

  let faviconUrl: string | null = null;

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

    if (shortcutIcon.ok) faviconUrl = shortcutIconElement.getAttribute("href");
  }

  if (!faviconUrl && new URL(url).pathname !== "/") {
    const response = await fetch(new URL("/", url).href, requestOptions);
    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document: Document = dom.window.document;

    faviconUrl = await getFaviconUrl(new URL("/", url).href, document);

    return faviconUrl ? new URL(faviconUrl, url).toString() : null;
  }

  if (!faviconUrl) {
    faviconUrl = new URL("favicon.ico", url).href;
  }

  return faviconUrl ? new URL(faviconUrl, url).toString() : null;
};

const getOgImageUrl = async (
  url: string,
  document: Document
): Promise<string | null> => {
  let ogImageUrl: string | null | undefined = null;

  let ogImageElement = document.querySelector("meta[property='og:image']");

  if (!ogImageElement) {
    ogImageElement = document.querySelector("meta[name='og:image']");
  }

  ogImageUrl = ogImageElement?.getAttribute("content");

  if (!ogImageUrl) {
    const twitterImageElement = document.querySelector(
      "meta[name='twitter:image']"
    );
    const twitterImageUrl: string | null | undefined =
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
        new URL(imageElement.getAttribute("src") ?? "", url).href
      );

      if (imageResponse.ok) ogImageUrl = imageElement.getAttribute("src");
    }
  }

  if (!ogImageUrl && new URL(url).pathname !== "/") {
    const response = await fetch(new URL("/", url).href, requestOptions);
    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document: Document = dom.window.document;

    ogImageUrl = await getOgImageUrl(new URL("/", url).href, document);

    return ogImageUrl ? new URL(ogImageUrl, url).toString() : null;
  }

  return ogImageUrl ? new URL(ogImageUrl, url).toString() : null;
};

// tries to get the title from the given url, if it fails, it tries to get the title from the root url
const getTitle = async (url: string, document: Document): Promise<string> => {
  let title: string | null | undefined = null;

  title = document
    .querySelector("meta[property='og:title']")
    ?.getAttribute("content");

  if (!title) title = document.querySelector("title")?.textContent;

  const rootUrl = new URL("/", url).href;

  if (!title) {
    const response = await fetch(rootUrl, requestOptions);
    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    title = document
      .querySelector("meta[property='og:title']")
      ?.getAttribute("content");

    if (!title) title = document.querySelector("title")?.textContent;
  }

  if (!title) {
    title =
      rootUrl.split("/")[2]?.split(".")[0] === "www"
        ? capitalizeFirstLetter(rootUrl.split("/")[2]?.split(".")[1] ?? "")
        : capitalizeFirstLetter(rootUrl.split("/")[2]?.split(".")[0] ?? "");
  }

  return title;
};

export const requestOptions: RequestInit = {
  redirect: "follow",
  follow: 20,
  headers: {
    mode: "same-origin",
    Cookie:
      "guest_id=v1%3A169688089407904299; guest_id_ads=v1%3A169688089407904299; guest_id_marketing=v1%3A169688089407904299;",
  },
};

const getMetadataThroughLib = async (
  url: string
): Promise<{
  logo: string | null;
  image: string | null;
  pageTitle: string | null;
}> => {
  const getHTML = require("html-get");
  const browserless = require("browserless")();

  const getContent = (url: string) => {
    // create a browser context inside the main Chromium process
    const browserContext = browserless.createContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const promise = getHTML(url, { getBrowserless: () => browserContext });
    // close browser resources before return the result
    promise
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .then(() => browserContext)
      .then((browser: { destroyContext: () => unknown }) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        browser.destroyContext()
      );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return promise;
  };

  const metascraper = require("metascraper")([
    require("metascraper-author")(),
    require("metascraper-image")(),
    require("metascraper-logo")(),
    require("metascraper-title")(),
    require("metascraper-url")(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await getContent(url)
    .then(metascraper)
    .then(browserless.close)
    .then((metadata: Metadata) => {
      console.log(metadata);
      return metadata;
    });
};
