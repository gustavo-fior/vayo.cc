import { type GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";

export default function Home() {
  const [signingIn, setSigningIn] = useState(false);

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
        <div className="container flex flex-col items-center justify-center  px-4 py-16 ">
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

          <p className="load -translate-y-3 pt-4 text-slate-400 transition duration-500">
            Simple bookmark manager with a focus on privacy.
          </p>
          <p className="load -translate-y-3 pt-3 italic text-slate-400 transition duration-500">
            No tracking, no ads, no analytics.
          </p>
          <div className="load flex -translate-y-3 items-center gap-2 pt-8 transition duration-200">
            {signingIn ? (
              <svg
                aria-hidden="true"
                className="h-8 w-8 mt-4 animate-spin fill-white dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                  stroke-width="8"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                  stroke-width="8"
                />
              </svg>
            ) : (
              <>
                <button
                  className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                  onClick={() => {
                    setSigningIn(true);
                    handleSignIn("google");
                  }}
                >
                  <p>Sign in with</p>
                  <BsGoogle size={16} />
                </button>
                <button
                  className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                  onClick={() => {
                    setSigningIn(true);
                    handleSignIn("github");
                  }}
                >
                  <p>Sign in with</p>
                  <BsGithub size={16} />
                </button>
              </>
            )}
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
