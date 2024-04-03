import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
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
        <title>Vayo</title>
        <meta name="description" content="Keeping bookmarks" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Looking for cool bookmarks? Check out this folder!"
        />
        <meta property="og:title" content={"Vayo"} />
        <meta
          property="og:description"
          content="Looking for cool bookmarks? Check out this folder!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`https://vayo.cc/api/og`} />
      </Head>
      <motion.main className="flex min-h-screen flex-col items-center justify-center bg-[#111111] align-middle">
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          exit={{ opacity: 0 }}
        >
        <ThreeDodecahedron />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          exit={{ opacity: 0 }}
        >
          <h1 className="mt-4 text-4xl font-bold text-white">Vayo</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
          exit={{ opacity: 0 }}
        >
          <p className="pt-4 italic text-zinc-500">
            A home for your most amazing links
          </p>
        </motion.div>

        <motion.div
          className=" flex items-center gap-2 pt-6 transition duration-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.7 } }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <motion.button
              whileTap={{
                scale: 0.95,
              }}
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white no-underline transition duration-300 hover:bg-white/20"
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
                    width={16}
                    height={16}
                  />
                </div>
              )}
            </motion.button>
            <motion.button
              whileTap={{
                scale: 0.95,
              }}
              className=" rounded-full bg-white/10 px-6 py-3 font-semibold text-white no-underline transition duration-300 hover:bg-white/20"
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
                  <GitHubLogoIcon />
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>
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
