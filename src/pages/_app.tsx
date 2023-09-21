import { GeistProvider } from '@geist-ui/core';
import '@radix-ui/themes/styles.css';
import { Analytics } from "@vercel/analytics/react";
import 'inter-ui/inter.css';
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <GeistProvider>
        {/* <CssBaseline /> */}
        <Component {...pageProps} />
        <Analytics />
      </GeistProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
