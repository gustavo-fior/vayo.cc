import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    const fontData = await fetch(
      new URL("../../../assets/Alice-Regular.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom right, #18181b, #09090b)",
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
              marginLeft: 240,
              marginTop: 96,
            }}
          >
            <div
              tw="font-bold"
              style={{
                fontSize: 312,
                letterSpacing: "-0.025em",
                fontFamily: "Alice",
                color: "white",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
              }}
            >
              VAYØ
            </div>
          </div>
        </div>
      ),
      {
        width: 1920,
        height: 1080,
        fonts: [
          {
            name: "Alice",
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
