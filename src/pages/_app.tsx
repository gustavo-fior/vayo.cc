import { GeistProvider } from "@geist-ui/core";
import "@radix-ui/themes/styles.css";
import { Analytics } from "@vercel/analytics/react";
import "inter-ui/inter.css";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import { ThemeProvider } from "next-themes";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <GeistProvider>
          {/* <CssBaseline /> */}
          <Component {...pageProps} />
          <Analytics />
        </GeistProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
