import "@radix-ui/themes/styles.css";
import "inter-ui/inter.css";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "~/styles/globals.css";
import { Toaster } from 'sonner';
import { api } from "~/utils/api";
import { ThemeProvider } from "next-themes";
import { type Session } from "next-auth";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from '@vercel/analytics/react';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {/* <CssBaseline /> */}
        <Component {...pageProps} />
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
