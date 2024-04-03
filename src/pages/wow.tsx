import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { BookmarksList } from "~/components/BookmarksList";
import { Separator } from "~/components/Separator";
import ThreeDodecahedron from "~/components/ThreeDodecahedron";

export default function Home() {
  const [signingInGithub, setSigningInGithub] = useState(false);
  const [signingInGoogle, setSigningInGoogle] = useState(false);

  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  type Bookmarks = {
    createdAt: Date;
    id: string;
    title: string;
    url: string;
    faviconUrl: string | null;
    ogImageUrl: string | null;
    loading?: boolean;
    onClick?: () => void;
  };

  const bookmarks: Bookmarks[] = [
    {
      createdAt: new Date(),
      id: "1",
      title: "Sign in with GitHub",
      url: "https://github.com/sign-in",
      faviconUrl: "/favicons/github-white.svg",
      ogImageUrl: null,
      loading: signingInGithub,
      onClick: () => {
        setSigningInGithub(true);
        handleSignIn("github");
      },
    },
    {
      createdAt: new Date(),
      id: "2",
      title: "Sign in with Google",
      url: "https://google.com/sign-in",
      faviconUrl: "/favicons/google.ico",
      ogImageUrl: null,
      loading: signingInGoogle,
      onClick: () => {
        setSigningInGoogle(true);
        handleSignIn("google");
      },
    },
    {
      createdAt: new Date(),
      id: "3",
      title: "Chrome Extension",
      url: "https://chromewebstore.google.com/detail/jaloallboddnknljngplmccchmncogeb?hl=pt-BR",
      faviconUrl:
        "https://www.google.com/chrome/static/images/favicons/apple-icon-180x180.png",
      ogImageUrl: null,
    },
    {
      createdAt: new Date(),
      id: "4",
      title: "GitHub Repo",
      url: "https://github.com/gustavo-fior/bookmarks",
      faviconUrl: "/favicons/github-white.svg",
      ogImageUrl: null,
    },
    {
      createdAt: new Date(),
      id: "5",
      title: "Creator",
      url: "https://gustavofior.com",
      faviconUrl: "https://www.gustavofior.com/favicon.ico",
      ogImageUrl: null,
    },
  ];

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
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen items-center justify-center bg-[#111111] align-middle"
      >
          <ThreeDodecahedron />
          <h1 className="text-4xl font-bold text-white mt-4">Vayo</h1>
          <p className="text-zinc-500">Keep your bookmarks safe</p>
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
