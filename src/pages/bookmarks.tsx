import { motion, type Variants } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { api } from "~/utils/api";

export default function Home() {
  const utils = api.useContext();
  const session = useSession();
  const [url, setUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  const handleSignOut = () => {
    signOut().catch((err) => console.error(err));
  };

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

  useEffect(() => {
    if (!isLoading && bookmarks?.length) {
      setIsOpen(true);
    }
  }, [isLoading, bookmarks]);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black] pt-32">
        <div className="w-[20rem] sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
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
                  className="w-96 rounded-full bg-white/10 px-6 py-2  font-semibold text-white no-underline placeholder-zinc-600 transition duration-300 hover:bg-white/20"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white/10 p-3 transition duration-300 hover:bg-white/20"
                >
                  <IoMdAdd color="white" size={16} strokeWidth={32} />
                </button>
              </div>
            </form>
            <button
              className="rounded-full bg-white/10 px-8 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => handleSignOut()}
            >
              <p>Sign out</p>
            </button>
          </div>
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            className="flex flex-col gap-8"
          >
            <motion.ul
              className="flex flex-col gap-6"
              variants={{
                open: {
                  transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.7,
                    delayChildren: 0.3,
                    staggerChildren: 0.05,
                  },
                },
                closed: {
                  transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.3,
                  },
                },
              }}
            >
              {isLoading ? (
                <p className="text-white">Loading... TODO: Skeleton</p>
              ) : (
                bookmarks?.map((bookmark) => (
                  <motion.li
                    variants={itemVariants}
                    key={bookmark.id}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex group justify-between rounded-lg p-2 transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 hover:drop-shadow-lg hover:backdrop-blur-lg"
                  >
                    <div>
                      <a
                        className="flex items-center gap-6"
                        href={bookmark.url}
                      >
                        {bookmark.ogImage ? (
                          <Image
                            src={String(bookmark.ogImage)}
                            alt={bookmark.title}
                            width={320}
                            height={180}
                            className="rounded-md"
                            style={{
                              height: "4rem",
                              width: "12rem",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="h-[6rem] w-[16rem] rounded-md bg-white/10" />
                        )}
                        <div className="flex flex-col gap-2">
                          <p className="truncate text-lg font-bold text-white">
                            {bookmark.title}
                          </p>
                          <div className="flex items-center gap-2 align-middle">
                            {bookmark.favicon && (
                              <Image
                                src={String(bookmark.favicon)}
                                alt={bookmark.title}
                                width={12}
                                height={12}
                                className="rounded-sm"
                                style={{ height: "0.9rem", width: "0.9rem" }}
                              />
                            )}
                            <p className="max-w-sm truncate text-sm text-slate-500">
                              {bookmark.url}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                    <button
                      className="absolute z-10 pr-4 font-bold text-red-500 opacity-0 group:hover:opacity-100 transition-opacity duration-300"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                    >
                      x
                    </button>
                  </motion.li>
                ))
              )}
            </motion.ul>
          </motion.div>
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
