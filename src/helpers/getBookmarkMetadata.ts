/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { URL } from "url";
import fetch, { type RequestInit } from "node-fetch";
import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

export const getBookmarkMetadata = async (
  url: string,
  options?: RequestInit
): Promise<BookmarkMetadata> => {
  try {

    const response = await fetch(
      url,
      options ?? {
        redirect: "follow",
        follow: 1,
        headers: {
          "mode": "same-origin",
          "Cookie": "guest_id=v1%3A169688089407904299; guest_id_ads=v1%3A169688089407904299; guest_id_marketing=v1%3A169688089407904299;",
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

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document: Document = dom.window.document;

    const title = await getTitle(url, document);
    const faviconUrl = await getFaviconUrl(url, document);
    const ogImageUrl = await getOgImageUrl(url, document);

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
  
  faviconUrl = commonFavicons(url);

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

    console.log(imageElement);
    console.log(imageElement?.getAttribute("src"));

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

  title = document.querySelector("title")?.textContent;

  if (!title)
    title = document
      .querySelector("meta[property='og:title']")
      ?.getAttribute("content");

  const rootUrl = new URL("/", url).href;

  if (!title) {
    const response = await fetch(rootUrl, requestOptions);
    const html = await response.text();
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    title = document.querySelector("title")?.textContent;

    if (!title)
      title = document
        .querySelector("meta[property='og:title']")
        ?.getAttribute("content");
  }

  if (!title) {
    title =
      rootUrl.split("/")[2]?.split(".")[0] === "www"
        ? capitalizeFirstLetter(rootUrl.split("/")[2]?.split(".")[1] ?? "")
        : capitalizeFirstLetter(rootUrl.split("/")[2]?.split(".")[0] ?? "");
  }

  return title;
};

const commonFavicons = (url: string): string | null => {
  switch (new URL(url).hostname) {
    case "www.youtube.com" || "youtube.com" || "youtu.be" || "www.youtu.be":
      return "https://www.youtube.com/s/desktop/d7e8df8d/img/favicon_144x144.png";
    case "www.reddit.com" || "reddit.com":
      return "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png";
    case "www.twitter.com" || "twitter.com" || "x.com" || "www.x.com":
      return "https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png";
    case "www.facebook.com" || "facebook.com":
      return "https://static.xx.fbcdn.net/rsrc.php/yk/r/TYhiZ_A7dmu.ico?_nc_eui2=AeELWzzclFoqXRmOGSkBK_HTQSByOY5TAQZBIHI5jlMBBmYQAX8a7Ss93kTcZM45VBym6Ey-Bj9gc09mk2qlb-B2";
    case "www.instagram.com" || "instagram.com":
      return "https://static.cdninstagram.com/rsrc.php/v3/yG/r/De-Dwpd5CHc.png";
    case "www.amazon.com" || "amazon.com":
      return "https://www.amazon.com/favicon.ico";
    case "www.netflix.com" || "netflix.com":
      return "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico";
    case "www.wikipedia.org" || "wikipedia.org":
      return "https://en.wikipedia.org/static/apple-touch/wikipedia.png";
    case "www.substack.com" || "substack.com":
      return "https://substackcdn.com/icons/substack/apple-touch-icon-1024x1024.png";
    case "www.medium.com" || "medium.com":
      return "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png";
    case "www.nytimes.com" || "nytimes.com":
      return "https://static.nytimes.com/favicon.ico";
    case "www.wsj.com" || "wsj.com":
      return "https://s.wsj.net/media/wsj_apple-touch-icon.png";
    case "www.apple.com" || "apple.com":
      return "https://www.apple.com/favicon.ico";
    case "www.microsoft.com" || "microsoft.com":
      return "https://www.microsoft.com/favicon.ico";
    case "www.google.com" || "google.com":
      return "https://www.google.com/favicon.ico";
    case "www.yahoo.com" || "yahoo.com":
      return "https://www.yahoo.com/favicon.ico";
    case "www.bing.com" || "bing.com":
      return "https://www.bing.com/favicon.ico";
    default:
      return null;
  }
}

export const requestOptions : RequestInit = {
  redirect: "follow",
  follow: 20,
  headers: {
    "mode": "same-origin",
    "Cookie": "guest_id=v1%3A169688089407904299; guest_id_ads=v1%3A169688089407904299; guest_id_marketing=v1%3A169688089407904299;",
  },
}