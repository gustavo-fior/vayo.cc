import { type GetServerSideProps } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";

export default function Home() {
  const utils = api.useContext();
  const session = useSession();

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

  // with optimistic updates
  const handleCreateBookmark = (url: string) => {
    const optimisticBookmark = {
      id: new Date().getTime().toString(), // Temporary ID
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: String(session.data?.user.id),
      url,
      title: "Loading...",
      favicon: "https://media0.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif",
      ogImage: "",
    };

    utils.bookmarks.findByUserId.setData(undefined, (prev) => {
      prev?.push(optimisticBookmark);
      return prev;
    });

    create.mutate({
      url,
    });
  };

  const handleDeleteBookmark = (id: string) => {
    // remove from cache
    utils.bookmarks.findByUserId.setData(undefined, (prev) => {
      prev?.filter((bookmark) => bookmark.id !== id);
      return prev;
    });

    // remove from server or rollback
    remove.mutate({
      id,
    });
  };

  const { data: bookmarks, isLoading } = api.bookmarks.findByUserId.useQuery();

  console.log(bookmarks);

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
          {isLoading ? (
            <p className="text-white">Loading...</p>
          ) : (
            bookmarks?.map((bookmark) => (
              <div key={bookmark.id} className="flex gap-4 ">
                <a
                  className="group flex items-center gap-6"
                  href={bookmark.url}
                >
                  {bookmark.favicon && (
                  <Image
                    src={String(bookmark.favicon)}
                    alt={bookmark.title}
                    width={24}
                    height={24}
                  />)}
                  {bookmark.ogImage && (
                  <Image
                    src={String(bookmark.ogImage)}
                    alt={bookmark.title}
                    width={300}
                    height={300}
                  />)}
                  <p className="text-xl font-bold text-white">
                    {bookmark.title}
                  </p>
                  <p className="text-gray-500">•</p>
                  <p className="text-gray-500">
                    <span className="group-hover:underline">
                      {bookmark.url}
                    </span>
                  </p>
                </a>
                <button
                  className="z-10 font-bold text-red-500"
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                >
                  x
                </button>
              </div>
            ))
          )}
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
