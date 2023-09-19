import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import 'inter-ui/inter.css'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <GeistProvider>
        <Head>
          <title>Bookmarks</title>
          <meta name="description" content="Keeping bookmarks" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/* <CssBaseline /> */}
        <Component {...pageProps} />
        <Analytics />
      </GeistProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
