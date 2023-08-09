import { type GetServerSideProps } from "next";
import { getSession, signOut } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";

export default function Home() {
  const utils = api.useContext();

  const create = api.bookmarks.create.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const remove = api.bookmarks.delete.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const handleCreateBookmark = (url: string) => {
    create.mutate({
      url,
    });
  };

  const handleDeleteBookmark = (id: string) => {
    remove.mutate({
      id,
    });
  };

  const bookmarks = api.bookmarks.findByUserId.useQuery();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[black] to-[#333131]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateBookmark(e.target.url.value);
            }}
          >
            <div className="flex items-center gap-4">
              <input
                type="text"
                name="url"
                id="url"
                placeholder="https://example.com"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline placeholder-gray-500 transition hover:bg-white/20"
              />
              <button
                type="submit"
                className="rounded-full bg-white/10 px-6 py-3 font-extrabold text-white no-underline transition hover:bg-white/20"
              >
                +
              </button>
            </div>
          </form>
          {bookmarks.data?.map((bookmark) => (
            <div key={bookmark.id} className="flex gap-4">
              <a className="flex items-center gap-4" href={bookmark.url}>
                <Image
                  src={String(bookmark.favicon)}
                  alt={bookmark.title}
                  width={16}
                  height={16}
                />
                <p className="text-white">{bookmark.title}</p>
                <p className="text-gray-500">
                  <span className="hover:underline">{bookmark.url}</span>
                </p>
              </a>
              <button
                className="z-10 font-bold text-red-500"
                onClick={() => handleDeleteBookmark(bookmark.id)}
              >
                x
              </button>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signOut()}
            >
              <p>sign out</p>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
