import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import { BsGithub, BsGoogle } from "react-icons/bs";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="container flex flex-col items-center justify-center  px-4 py-16 ">
          <h1 className="text-5xl font-extrabold  text-white sm:text-[5rem]">
            Bookmarks
          </h1>
          <p className="text-lg text-slate-400 pt-8 font-semibold">
            Simple bookmark manager with a focus on privacy.
          </p>
          <p className="text-lg text-slate-400 pt-3 italic font-semibold">
            No tracking, no ads, no analytics.
          </p>
          <div className="flex items-center gap-2 pt-8">
            <button
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signIn("google")}
            >
              <p>Sign in with</p>
              <BsGoogle size={16} />
            </button>
            <button
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signIn("github")}
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
