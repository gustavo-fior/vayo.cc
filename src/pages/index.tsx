import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import { BsGithub, BsGoogle } from "react-icons/bs";

export default function Home() {
  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="container flex flex-col items-center justify-center  px-4 py-16 ">
          <h1 className="text-5xl font-extrabold  text-white sm:text-[5rem]">
            Bookmarks
          </h1>
          <p className="pt-8 text-lg font-semibold text-slate-400">
            Simple bookmark manager with a focus on privacy.
          </p>
          <p className="pt-3 text-lg font-semibold italic text-slate-400">
            No tracking, no ads, no analytics.
          </p>
          <div className="flex items-center gap-2 pt-8">
            <button
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => handleSignIn("google")}
            >
              <p>Sign in with</p>
              <BsGoogle size={16} />
            </button>
            <button
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => handleSignIn("github")}
            >
              <p>Sign in with</p>
              <BsGithub size={16} />
            </button>
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
