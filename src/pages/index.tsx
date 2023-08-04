import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";

export default function Home() {

  function handleBookmark(url: string) {
    
    console.log(url)
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[black] to-[#333131]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Bookmarks
          </h1>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleBookmark(e.target.url.value)
          }}>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                name="url"
                id="url"
                placeholder="https://example.com"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              />
              <button
                type="submit"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Bookmark
              </button>
            </div>
          </form>
          <div className="flex flex-col items-center gap-2">
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
