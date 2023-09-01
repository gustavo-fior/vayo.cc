import { type GetServerSideProps } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import { set } from "zod";

export default function Home() {
  const utils = api.useContext();
  const session = useSession();
  const [url, setUrl] = useState("");

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
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black] pt-32">
        <div className="w-[30rem] sm:w-[40rem] md:w-[50rem] lg:w-[60rem]">
          <div className="flex justify-between pb-16">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBookmark(url);
                setUrl("");
              }}
            >
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  name="url"
                  id="url"
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-full w-96 bg-white/10 px-8 py-3 text-xl font-semibold text-white no-underline placeholder-slate-600 duration-300 transition hover:bg-white/20"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white/10 p-3 duration-300 transition hover:bg-white/20"
                >
                  <IoMdAdd color="white" size={24} strokeWidth={20} />
                </button>
              </div>
            </form>
            <button
              className="rounded-full bg-white/10 px-10 py-3 text-xl font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => signOut()}
            >
              <p>Sign out</p>
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {isLoading ? (
              <p className="text-white">Loading...</p>
            ) : (
              bookmarks?.map((bookmark) => (
                <div key={bookmark.id} className="flex justify-between">
                  <div>
                    <a
                      className="group flex items-center gap-4"
                      href={bookmark.url}
                    >
                      {bookmark.favicon && (
                        <Image
                          src={String(bookmark.favicon)}
                          alt={bookmark.title}
                          width={20}
                          height={20}
                        />
                      )}
                      {/* {bookmark.ogImage && (
                  <Image
                    src={String(bookmark.ogImage)}
                    alt={bookmark.title}
                    width={300}
                    height={300}
                  />)} */}
                      <p className="truncate text-xl font-bold text-white">
                        {bookmark.title}
                      </p>
                      <p className="text-gray-500">•</p>
                      <p className="max-w-sm truncate text-slate-500">
                        <span className="  group-hover:underline">
                          {bookmark.url}
                        </span>
                      </p>
                    </a>
                  </div>
                  <button
                    className="z-10 pl-4 font-bold text-red-500"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  >
                    x
                  </button>
                </div>
              ))
            )}
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
