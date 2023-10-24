export const getCommonFavicons = (url: string): string | null => {
  const host = getWebsiteName(url);

  switch (host) {
    case "youtube" || "youtu.be":
      return "https://youtube.com/s/desktop/d7e8df8d/img/favicon_144x144.png";
    case "reddit":
      return "https://redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png";
    case "twitter" || "x":
      return "https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png";
    case "facebook":
      return "https://static.xx.fbcdn.net/rsrc.php/yk/r/TYhiZ_A7dmu.ico?_nc_eui2=AeELWzzclFoqXRmOGSkBK_HTQSByOY5TAQZBIHI5jlMBBmYQAX8a7Ss93kTcZM45VBym6Ey-Bj9gc09mk2qlb-B2";
    case "instagram":
      return "https://static.cdninstagram.com/rsrc.php/v3/yG/r/De-Dwpd5CHc.png";
    case "amazon":
      return "https://amazon.com/favicon.ico";
    case "netflix":
      return "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico";
    case "wikipedia":
      return "https://en.wikipedia.org/static/apple-touch/wikipedia.png";
    case "substack":
      return "https://substackcdn.com/icons/substack/apple-touch-icon-1024x1024.png";
    case "medium":
      return "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png";
    case "nytimes.com":
      return "https://static.nytimes.com/favicon.ico";
    case "wsj.com":
      return "https://s.wsj.net/media/wsj_apple-touch-icon.png";
    case "apple.com":
      return "https://apple.com/favicon.ico";
    case "microsoft.com":
      return "https://microsoft.com/favicon.ico";
    case "google.com":
      return "https://google.com/favicon.ico";
    case "yahoo.com":
      return "https://yahoo.com/favicon.ico";
    case "bing.com":
      return "https://bing.com/favicon.ico";
    default:
      return null;
  }
};

export const getWebsiteName = (url: string) => {
  let websiteName = "";
  try {
    const parsedURL = new URL(url);
    const hostnameParts = parsedURL.hostname.split(".");
    let domainName = "";
    if (hostnameParts.length >= 2) {
      if (
        hostnameParts[0]?.toLowerCase() === "www" ||
        hostnameParts[0]?.toLowerCase() === "m" ||
        hostnameParts[0]?.toLowerCase() === "mobile" ||
        hostnameParts[0]?.toLowerCase() === "en" ||
        hostnameParts[0]?.toLowerCase() === "br" ||
        hostnameParts[0]?.toLowerCase() === "es" ||
        hostnameParts[0]?.toLowerCase() === "fr" ||
        hostnameParts[0]?.toLowerCase() === "de" ||
        hostnameParts[0]?.toLowerCase() === "it" ||
        hostnameParts[0]?.toLowerCase() === "ja" ||
        hostnameParts[0]?.toLowerCase() === "ru" ||
        hostnameParts[0]?.toLowerCase() === "zh" ||
        hostnameParts[0]?.toLowerCase() === "ar" ||
        hostnameParts[0]?.toLowerCase() === "hi" ||
        hostnameParts[0]?.toLowerCase() === "pt" ||
        hostnameParts[0]?.toLowerCase() === "ko" ||
        hostnameParts[0]?.toLowerCase() === "id" ||
        hostnameParts[0]?.toLowerCase() === "tr" ||
        hostnameParts[0]?.toLowerCase() === "pl"
      ) {
        domainName = hostnameParts[1] ?? "";
      } else {
        if (
          hostnameParts[1]?.toLowerCase() !== "com" &&
          hostnameParts[1]?.toLowerCase() !== "co" &&
          hostnameParts[1]?.toLowerCase() !== "org" &&
          hostnameParts[1]?.toLowerCase() !== "net" &&
          hostnameParts[1]?.toLowerCase() !== "gov" &&
          hostnameParts[1]?.toLowerCase() !== "edu" &&
          hostnameParts[1]?.toLowerCase() !== "io" &&
          hostnameParts[1]?.toLowerCase() !== "dev"
        ) {
          domainName = hostnameParts[1] ?? "";
        } else {
          domainName = hostnameParts[0] ?? "";
        }
      }
      if (domainName.includes("com")) {
        const index = domainName.indexOf("com");
        websiteName = domainName.slice(0, index + 3);
      } else {
        websiteName = domainName;
      }
    } else {
      websiteName = parsedURL.hostname;
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
  }
  return websiteName;
};
