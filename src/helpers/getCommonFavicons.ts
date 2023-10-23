export const getCommonFavicons = (url: string): string | null => {
  console.log("hostname: ", new URL(url).hostname);

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
    case "www.wikipedia.org" ||
      "wikipedia.org" ||
      "en.wikipedia.org" ||
      "www.en.wikipedia.org" ||
      "m.wikipedia.org" ||
      "www.m.wikipedia.org" ||
      "br.wikipedia.org" ||
      "www.br.wikipedia.org":
      return "https://en.wikipedia.org/static/apple-touch/wikipedia.png";
    case "www.substack.com" || "substack.com":
      return "https://substackcdn.com/icons/substack/apple-touch-icon-1024x1024.png";
    case "www.medium.com" || "medium.com" || "www.**.medium.com":
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
};
