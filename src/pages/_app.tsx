import "@radix-ui/themes/styles.css";
import { Analytics } from "@vercel/analytics/react";
import "inter-ui/inter.css";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import { ThemeProvider } from "next-themes";
import { type Session } from "next-auth";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
          {/* <CssBaseline /> */}
          <Component {...pageProps} />
          <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
