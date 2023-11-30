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
          {/* Texture overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "url('https://img.freepik.com/premium-vector/abstract-dark-background-small-squares-pixels-shades-black-gray-colors_444390-496.jpg')", // Replace with the path to your texture image
              opacity: 0.15, // Adjust the opacity as needed
            }}
          ></div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              justifyItems: "flex-start",
            }}
          ></div>
          <div
            tw="font-bold"
            style={{
              fontSize: 96,
              letterSpacing: "-0.025em",
              fontFamily: "Inter",
              color: "white",
              marginTop: 30,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              marginLeft: 48,
            }}
          >
            Bookmarks
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
