import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    const fontData = await fetch(
      new URL("../../../assets/Inter-Bold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom right, #000000, #111111)",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
            position: "relative",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              justifyItems: "flex-start",
            }}
          ></div>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifyItems: "center",
              marginLeft: 96,
              marginTop: 96,
            }}
          >
            <img
              src="https://bookmarks.gustavofior.com/images/logo.png"
              alt="logo"
              width={96}
              height={96}
            />
            <div
              tw="font-bold"
              style={{
                fontSize: 96,
                letterSpacing: "-0.025em",
                fontFamily: "Inter",
                color: "white",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                marginLeft: 32,
              }}
            >
              Bookmarks
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    console.log(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
