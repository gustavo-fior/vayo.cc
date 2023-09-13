import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { Spinner } from "~/components/Spinner";
import { motion } from "framer-motion";

export default function Home() {
  const [signingInGithub, setSigningInGithub] = useState(false);
  const [signingInGoogle, setSigningInGoogle] = useState(false);

  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  useEffect(() => {
    const load = document.getElementsByClassName("load");
    if (load.length > 0) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < load.length; i++) {
        load[i]?.classList.remove("-translate-y-3");
      }
    }
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="container flex flex-col items-center justify-center px-4 py-16 ">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={64}
            height={64}
            className="load -translate-y-3 transition duration-1000"
          />
          <h1 className=" load -translate-y-3 pt-4 text-5xl font-extrabold text-white transition duration-700 sm:text-[5rem]">
            Bookmarks
          </h1>

          <p className="load hidden -translate-y-3 pt-4 text-center text-slate-400 transition duration-500 md:block">
            Simple bookmark manager with a focus on privacy.
          </p>
          <p className="load -translate-y-3 pt-3 italic text-slate-400 transition duration-500">
            No tracking, no ads, no price.
          </p>
          <div className="load flex -translate-y-3 items-center gap-2 pt-8 transition duration-200">
            <div className="flex flex-col gap-4 md:flex-row">
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                disabled={signingInGoogle || signingInGithub}
                onClick={() => {
                  setSigningInGoogle(true);
                  handleSignIn("google");
                }}
              >
                {signingInGoogle ? (
                  <div className="px-12">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <BsGoogle size={16} />
                  </div>
                )}
              </motion.button>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                className=" rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                disabled={signingInGoogle || signingInGithub}
                onClick={() => {
                  setSigningInGithub(true);
                  handleSignIn("github");
                }}
              >
                {signingInGithub ? (
                  <div className="px-12">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <BsGithub size={16} />
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
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
