import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[black] to-[#333131]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Bookmarks
          </h1>
          <div className="flex flex-col items-center gap-2">
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signIn("google")}
            >
              <p>sign in with google</p>
            </button>
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signIn("github")}
            >
              <p>sign in with github</p>
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
