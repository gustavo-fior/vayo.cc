import { type Folder } from "@prisma/client";
import { ImageResponse } from "@vercel/og";
import { type NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const req = await fetch(
      `https://bookmarks.gustavofior.com/api/trpc/folders.findNameAndIconById?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22id%22%3A%22${searchParams.get(
        "id"
      )}%22%7D%7D%7D`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resp = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const folder = resp[0].result.data.json as Folder;

    const fontData = await fetch(
      new URL("../../../assets/Inter-Bold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "black",
            backgroundSize: "150px 150px",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
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
              marginLeft: 40,
            }}
          >
            {folder.icon ? folder?.icon + " " + folder?.name : folder?.name}
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
