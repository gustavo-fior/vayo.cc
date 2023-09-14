import { type Bookmark } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { IoMdAdd, IoMdMenu } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import CompactBookmark from "~/components/CompactBookmark";
import { CompactSkeleton } from "~/components/CompactSkeleton";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { ExpandedSkeleton } from "~/components/ExpandedSkeleton";
import { ShareButton } from "~/components/ShareButton";
import { SignOutButton } from "~/components/SignOutButton";
import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import { FolderSkeleton } from "~/components/FolderSkeleton";
import { CreateFolderButton } from "~/components/CreateFolderButton";
import { DeleteFolderButton } from "~/components/DeleteFolderButton";

export default function Bookmarks() {
  const session = useSession();
  const utils = api.useContext();
  const [inputUrl, setInputUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">(
    "expanded"
  );

  const { data: folders, isLoading: foldersLoading } =
    api.folders.findByUserId.useQuery({
      userId: String(session.data?.user.id),
    });

  const [currentFolderId, setCurrentFolderId] = useState<string>("");

  const { data: bookmarks, isLoading: bookmarksLoading } =
    api.bookmarks.findByFolderId.useQuery({
      folderId: String(currentFolderId),
    });

  const addBookmark = api.bookmarks.create.useMutation({
    onMutate: async () => {
      setInputUrl("");

      //optimistic update
      await utils.bookmarks.findByFolderId.cancel();

      const previousBookmarks = utils.bookmarks.findByFolderId.getData();

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolderId) },
        (oldQueryData: Bookmark[] | undefined) => {
          const newBookmark: Bookmark = {
            id: "temp",
            url: inputUrl,
            title: "Loading...",
            folderId: "temp",
            favicon: null,
            ogImage: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return oldQueryData ? [...oldQueryData, newBookmark] : [newBookmark];
        }
      );

      return { previousBookmarks };
    },

    onSettled: () => {
      void utils.bookmarks.findByFolderId.invalidate();
    },
    onError: (context) => {
      const previousBookmarks =
        (context as { previousBookmarks?: Bookmark[] })?.previousBookmarks ??
        null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolderId) },
        previousBookmarks!
      );
    },
  });

  const deleteBookmark = api.bookmarks.delete.useMutation({
    onMutate: async ({ id }) => {
      //optimistic update
      await utils.bookmarks.findByFolderId.cancel();

      const previousBookmarks = utils.bookmarks.findByFolderId.getData();

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolderId) },
        (previousBookmarks: Bookmark[] | undefined) =>
          [
            ...(previousBookmarks?.filter((bookmark) => bookmark.id !== id) ??
              []),
          ] as Bookmark[]
      );

      return { previousBookmarks };
    },

    onSettled: () => {
      void utils.bookmarks.findByFolderId.invalidate();
    },
    onError: (context) => {
      const previousBookmarks =
        (context as { previousBookmarks?: Bookmark[] })?.previousBookmarks ??
        null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolderId) },
        previousBookmarks!
      );
    },
  });

  const handleCreateBookmark = useCallback(() => {
    addBookmark.mutate({
      url: inputUrl,
      folderId: String(currentFolderId),
    });
  }, [addBookmark, inputUrl, currentFolderId]);

  const handleDeleteBookmark = useCallback(
    (id: string) => {
      deleteBookmark.mutate({
        id,
      });
    },
    [deleteBookmark]
  );

  const handleChangeViewStyle = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(viewStyle === "compact" ? "expanded" : "compact");
  };

  // Opening the bookmarks list
  useEffect(() => {
    if (!bookmarksLoading && bookmarks?.length) {
      setIsOpen(true);
    }
  }, [bookmarksLoading, bookmarks]);

  // Setting the current folder id
  useEffect(() => {
    if (!foldersLoading && folders && folders?.length > 0) {
      setCurrentFolderId(folders[0]?.id ?? "");
    }
  }, [folders, foldersLoading]);

  console.log("bookmarks", bookmarks);
  console.log("bookmarksLoading", bookmarksLoading);
  console.log("folders", folders);
  console.log("foldersLoading", foldersLoading);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="w-[20rem] py-16 sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 align-middle lg:flex-row lg:gap-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBookmark();
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  name="url"
                  id="url"
                  value={inputUrl}
                  disabled={addBookmark.isLoading || !currentFolderId}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-72 rounded-full bg-white/10 px-6 py-2 font-semibold text-white no-underline placeholder-zinc-600 transition duration-300 hover:bg-white/20 md:w-96"
                />
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  type="submit"
                  disabled={
                    inputUrl.length === 0 ||
                    addBookmark.isLoading ||
                    !currentFolderId
                  }
                  className={`duration-300'hover:bg-white/20 rounded-full bg-white/10 p-3 transition ${
                    inputUrl.length === 0 || addBookmark.isLoading
                      ? "bg-white/5"
                      : null
                  }`}
                >
                  {addBookmark.isLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <IoMdAdd color="white" size={16} strokeWidth={32} />
                  )}
                </motion.button>
              </div>
            </form>

            <div className="flex items-center gap-2 align-middle">
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                onClick={() => handleChangeViewStyle()}
                className="rounded-full bg-white/10 p-3 no-underline transition hover:bg-white/20"
              >
                <AnimatePresence mode="popLayout">
                  {viewStyle === "compact" ? (
                    <motion.div
                      key="compact"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <IoMdMenu color="white" size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <FiMenu color="white" size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <ShareButton folderId={currentFolderId} />
              <SignOutButton />
            </div>
          </div>
          <div className="mx-2 my-6  h-[2px] w-full rounded-full bg-white/5" />
          <div className="flex justify-between px-2 pb-4 align-middle">
            <div className="flex items-center gap-x-2 overflow-x-auto ">
              {foldersLoading ? (
                [...Array<number>(3)].map((_, i) => <FolderSkeleton key={i} />)
              ) : folders && folders?.length > 0 ? (
                folders?.map((folder) => (
                  <motion.div
                    whileTap={{
                      scale: 0.8,
                    }}
                    onClick={() => {
                      setCurrentFolderId(folder.id);
                      setIsOpen(false);
                      void utils.bookmarks.findByFolderId.invalidate();
                    }}
                    key={folder.id}
                    className={`${
                      currentFolderId === folder.id ? "bg-white/30" : ""
                    } flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 align-middle font-semibold text-white no-underline transition hover:cursor-pointer hover:bg-white/20`}
                  >
                    <div>{folder.icon}</div>
                    <div>{folder.name}</div>
                  </motion.div>
                ))
              ) : (
                <p className={`text-center italic text-gray-500`}>
                  It&apos;s pretty calm here, add some folders!
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <DeleteFolderButton
                folderId={currentFolderId}
                setCurrentFolderId={setCurrentFolderId}
              />
              <CreateFolderButton />
            </div>
          </div>
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            className="flex flex-col gap-8"
          >
            <motion.ul
              className={`flex flex-col ${
                viewStyle === "compact" ? "gap-3" : "gap-6"
              }`}
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
              {bookmarksLoading || foldersLoading ? (
                [...Array<number>(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: i * 0.05 } }}
                    exit={{ opacity: 0 }}
                  >
                    {viewStyle === "compact" ? (
                      <CompactSkeleton key={i} />
                    ) : (
                      <ExpandedSkeleton key={i} />
                    )}
                  </motion.div>
                ))
              ) : bookmarks && bookmarks?.length > 0 ? (
                bookmarks.map((bookmark) => (
                  <div key={bookmark.id}>
                    {viewStyle === "compact" ? (
                      <CompactBookmark
                        onRemove={handleDeleteBookmark}
                        bookmark={bookmark}
                      />
                    ) : (
                      <ExpandedBookmark
                        onRemove={handleDeleteBookmark}
                        bookmark={bookmark}
                      />
                    )}
                  </div>
                ))
              ) : bookmarks?.length === 0 && (
                <div>
                  <Image
                    src="/images/hay.png"
                    className={`mx-auto pt-20 opacity-80`}
                    alt="hay"
                    width={180}
                    height={180}
                  />
                  <p
                    className={`text-center text-gray-500 ${
                      viewStyle === "compact" ? "pt-7" : "pt-4"
                    } italic`}
                  >
                    Not much down here... Add some bookmarks!
                  </p>
                </div>
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
