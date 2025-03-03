import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "~/components/Spinner";
import ThreeDodecahedron from "~/components/ThreeDodecahedron";

export default function Home() {
  const [signingInGithub, setSigningInGithub] = useState(false);
  const [signingInGoogle, setSigningInGoogle] = useState(false);

  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  return (
    <>
      <Head>
        <title>VAYØ</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="A home for your most amazing links :)"
        />
        <meta property="og:title" content={"VAYØ"} />
        <meta
          property="og:description"
          content="A home for your most amazing links :)"
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`https://vayo.me/api/og`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alice&display=swap"
          rel="stylesheet"
        />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="5f36385d-9b15-4127-925b-808fba9d75d3"></script>
      </Head>
      <motion.main className="flex min-h-screen flex-col items-center justify-between bg-[#111111]">
        <div className="h-[30vh]" />
        <div className="z-10 flex h-[20vh] md:w-96 w-72 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            exit={{ opacity: 0 }}
          >
            <h1
              className="text-3xl font-bold text-white"
              style={{
                fontFamily: "Alice",
              }}
            >
              VAYØ
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            exit={{ opacity: 0 }}
            className="pt-4  text-zinc-500"
          >
            A home for your most amazing links. Here you can save, organize and
            share your bookmarks.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            exit={{ opacity: 0 }}
            className="pt-4  text-zinc-500"
          >
            Check out our{" "}
            <Link
              target="_blank"
              href="https://chromewebstore.google.com/detail/vayo/jaloallboddnknljngplmccchmncogeb?hl=pt-BR"
              className="font-semibold text-zinc-300 transition duration-200 ease-in-out hover:text-zinc-50"
            >
              Chrome Extension
            </Link>
            .
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
            exit={{ opacity: 0 }}
            className="flex items-center pt-4 text-zinc-500"
          >
            Created by{" "}
            <Link
              target="_blank"
              href="https://gustavofior.com"
              className="flex items-center gap-1.5 font-semibold text-zinc-300 transition duration-200 ease-in-out hover:text-zinc-50"
            >
              <Image
                src="/images/eu.png"
                alt="Gustavo Fior"
                width={16}
                height={16}
                className="ml-2 rounded-full"
              />{" "}
              Gustavo
            </Link>
            .
          </motion.p>

          <motion.div
            className=" flex items-center gap-2 md:pt-8 pt-16 transition duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8 } }}
            exit={{ opacity: 0 }}
          >
            <div className="flex w-full items-center justify-between flex-col md:flex-row md:gap-0 gap-6">
              <motion.button
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 md:w-44 w-72 md:h-10 h-16 md:text-sm text-lg font-semibold text-white no-underline transition duration-200 hover:bg-white/20"
                disabled={signingInGoogle || signingInGithub}
                onClick={() => {
                  setSigningInGoogle(true);
                  handleSignIn("google");
                }}
              >
                {signingInGoogle ? (
                  <div className="px-12">
                    <Spinner size="md" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <Image
                      src="/favicons/google.ico"
                      alt="Google logo"
                      width={18}
                      height={18}
                    />
                  </div>
                )}
              </motion.button>
              <div className="hidden h-4 w-0.5 rounded-full bg-white/10 md:block" />
              <motion.button
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 md:w-44 w-72 md:h-10 h-16 md:text-sm text-lg font-semibold text-white no-underline transition duration-200 hover:bg-white/20"
                disabled={signingInGoogle || signingInGithub}
                onClick={() => {
                  setSigningInGithub(true);
                  handleSignIn("github");
                }}
              >
                {signingInGithub ? (
                  <div className="px-12">
                    <Spinner size="md" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <GitHubLogoIcon className="h-5 w-5" />
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
        <div className="h-[50vh] w-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{
              opacity: 1,
              transition: { delay: 1, duration: 0.5 },
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            className="hidden md:flex w-full items-center justify-center"
          >
            <ThreeDodecahedron />
          </motion.div>
        </div>
      </motion.main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/bookmarks",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
