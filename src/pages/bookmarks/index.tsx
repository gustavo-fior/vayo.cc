import { type Bookmark } from "@prisma/client";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { BookmarksList } from "~/components/BookmarksList";
import { CreateFolderButton } from "~/components/CreateFolderButton";
import { DeleteFolderButton } from "~/components/DeleteFolderButton";
import { EmptyState } from "~/components/EmptyState";
import { FolderSkeleton } from "~/components/FolderSkeleton";
import { ProfileMenu } from "~/components/ProfileMenu";
import { Separator } from "~/components/Separator";
import { ShareButton } from "~/components/ShareButton";
import { SkeletonList } from "~/components/SkeletonList";
import { Spinner } from "~/components/Spinner";
import {
  currentFolderAtom,
  directionAtom,
  isOpenAtom,
  viewStyleAtom,
  showMonthsAtom,
} from "~/helpers/atoms";
import { capitalizeFirstLetter } from "~/helpers/capitalizeFirstLetter";
import { getCommonFavicons, getWebsiteName } from "~/helpers/getCommonFavicons";
import { getFaviconForFolder } from "~/helpers/getFaviconForFolder";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const session = useSession();
  const utils = api.useContext();
  const [inputUrl, setInputUrl] = useState("");
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [viewStyle] = useAtom(viewStyleAtom);
  const [direction] = useAtom(directionAtom);
  const [showMonths] = useAtom(showMonthsAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);

  const { data: folders, isLoading: foldersLoading } =
    api.folders.findByUserId.useQuery(
      { userId: String(session.data?.user.id) },
      {
        onSuccess: (data) => {
          if (data && data?.length > 0) {
            if (currentFolder) {
              setCurrentFolder(
                data.find((folder) => folder.id === currentFolder.id) ??
                  data[0] ??
                  null
              );
            } else {
              setCurrentFolder(data[0] ?? null);
            }
          }
        },
      }
    );

  const addBookmark = api.bookmarks.create.useMutation({
    onMutate: () => {
      setInputUrl("");

      const newBookmark: Bookmark = {
        id: "temp",
        url: inputUrl,
        title: capitalizeFirstLetter(getWebsiteName(inputUrl)),
        folderId: String(currentFolder?.id),
        faviconUrl: getCommonFavicons(inputUrl),
        ogImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (direction === "desc") {
        currentFolder?.bookmarks?.unshift(newBookmark);
      } else {
        currentFolder?.bookmarks?.push(newBookmark);
      }
    },
    onSettled: () => {
      void utils.folders.findByUserId.refetch();
    },
    onError: (context) => {
      const previousBookmarks =
        (context as { previousBookmarks?: Bookmark[] })?.previousBookmarks ??
        null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolder?.id), direction: direction },
        previousBookmarks!
      );
    },
  });

  const deleteBookmark = api.bookmarks.delete.useMutation({
    onMutate: ({ id }) => {
      const listWithoutDeletedBookmark = currentFolder?.bookmarks?.filter(
        (bookmark) => bookmark.id !== id
      );

      if (listWithoutDeletedBookmark) {
        setCurrentFolder({
          ...currentFolder!,
          bookmarks: listWithoutDeletedBookmark,
        });
      }
    },
    onSettled: () => {
      void utils.folders.findByUserId.refetch();
    },
    onError: (context) => {
      const previousBookmarks =
        (context as { previousBookmarks?: Bookmark[] })?.previousBookmarks ??
        null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolder?.id), direction: direction },
        previousBookmarks!
      );
    },
  });

  const handleCreateBookmark = useCallback(() => {
    addBookmark.mutate({
      url: inputUrl,
      folderId: String(currentFolder?.id),
    });
  }, [addBookmark, inputUrl, currentFolder?.id]);

  const handleDeleteBookmark = useCallback(
    (id: string) => {
      deleteBookmark.mutate({
        id,
      });
    },
    [deleteBookmark]
  );

  // Opening the bookmarks list
  useEffect(() => {
    if (!foldersLoading && currentFolder?.bookmarks?.length) {
      setIsOpen(true);
    }
  }, [foldersLoading, currentFolder, setIsOpen]);

  // Scroll to the newly created bookmark
  useEffect(() => {
    const elementToScrollTo = document.getElementById("temp");

    if (elementToScrollTo) {
      // Get the element's position relative to the viewport
      const elementRect = elementToScrollTo.getBoundingClientRect();

      // Check if the element is not in the viewport
      if (
        elementRect.top < 0 ||
        elementRect.bottom > window.innerHeight ||
        elementRect.left < 0 ||
        elementRect.right > window.innerWidth
      ) {
        // Scroll to the element
        elementToScrollTo.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [currentFolder?.bookmarks?.length]);

  return (
    <>
      <Head>
        <title>{currentFolder?.name ?? "Bookmarks"}</title>
        <link rel="icon" href={getFaviconForFolder(currentFolder)} />
      </Head>
      <main className="relative min-h-screen w-full bg-gradient-to-br from-[#dfdfdf] to-[#f5f5f5] dark:from-[#202020] dark:to-[black]">
        <div className="flex flex-col items-center">
          <div className="w-[20rem]  sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
            <div className="pt-16 pb-32">
              <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 align-middle lg:flex-row lg:gap-0">
                <motion.form
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onSubmit={(e) => {
                    e.preventDefault();

                    if (
                      !currentFolder?.allowDuplicate &&
                      currentFolder?.bookmarks?.find(
                        (bookmark) => bookmark.url === inputUrl
                      )
                    ) {
                      setIsDuplicate(true);

                      setTimeout(() => {
                        setIsDuplicate(false);
                      }, 2000);

                      return;
                    }

                    handleCreateBookmark();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      name="url"
                      id="url"
                      value={isDuplicate ? "Duplicate" : inputUrl}
                      disabled={addBookmark.isLoading || !currentFolder}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://..."
                      className={`w-72 rounded-full bg-black/10 px-6 py-2 font-semibold text-black no-underline placeholder-slate-600 transition duration-300 ease-in-out placeholder:font-normal hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 md:w-96 ${
                        isDuplicate ? "ring-2 ring-red-500 focus:ring-0" : ""
                      }`}
                    />
                    <motion.button
                      whileTap={{
                        scale: 0.8,
                      }}
                      type="submit"
                      disabled={
                        inputUrl.length === 0 ||
                        addBookmark.isLoading ||
                        !currentFolder
                      }
                      className={`duration-300'hover:bg-white/20 rounded-full bg-black/10 p-3 transition dark:bg-white/10 ${
                        inputUrl.length === 0 || addBookmark.isLoading
                          ? "bg-black/5 dark:bg-white/5"
                          : null
                      }`}
                    >
                      {addBookmark.isLoading ? (
                        <Spinner size="md" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-black dark:text-white" />
                      )}
                    </motion.button>
                  </div>
                </motion.form>

                <div className="flex items-center gap-2 align-middle">
                  <ShareButton />
                  <ProfileMenu />
                </div>
              </div>

              <div className={`mx-2 my-6`}>
                <Separator />
              </div>

              <div className="flex justify-between px-0 align-middle md:px-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-x-2 overflow-x-auto "
                >
                  {foldersLoading ? (
                    [...Array<number>(3)].map((_, i) => (
                      <FolderSkeleton key={i} />
                    ))
                  ) : folders && folders?.length > 0 ? (
                    folders?.map((folder) => (
                      <motion.div
                        whileTap={{
                          scale: 0.8,
                        }}
                        onClick={() => {
                          if (
                            currentFolder?.id !== folder.id &&
                            folder.id !== "temp"
                          ) {
                            setCurrentFolder(folder);
                            setIsOpen(false);
                          }
                        }}
                        key={folder.id}
                        className={`${
                          currentFolder?.id === folder.id
                            ? "bg-black/20 dark:bg-white/30"
                            : ""
                        } group flex items-center gap-2 rounded-full bg-black/10 px-4 py-2 align-middle font-semibold text-black no-underline transition hover:cursor-pointer hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20`}
                      >
                        {folder.icon && <div>{folder.icon}</div>}
                        <div>{folder.name}</div>
                      </motion.div>
                    ))
                  ) : (
                    <p className={`text-center italic text-gray-500`}>
                      No folders yet, create one -{">"}
                    </p>
                  )}
                </motion.div>
                <div className="flex gap-2">
                  {folders && folders?.length > 0 && <DeleteFolderButton />}
                  <CreateFolderButton />
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  initial={isOpen}
                  animate={isOpen ? "open" : "closed"}
                  className="flex flex-col gap-8"
                >
                  <motion.ul
                    className={`flex flex-col`}
                    variants={{
                      open: {
                        transition: {
                          type: "spring",
                          bounce: 0,
                          duration: 0.7,
                          staggerChildren: 0.08,
                          delayChildren: 0.2,
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
                    {foldersLoading ? (
                      <SkeletonList viewStyle={viewStyle} />
                    ) : currentFolder?.bookmarks &&
                      currentFolder?.bookmarks?.length > 0 ? (
                      <BookmarksList
                        bookmarks={currentFolder?.bookmarks}
                        showMonths={showMonths}
                        viewStyle={viewStyle}
                        handleDeleteBookmark={handleDeleteBookmark}
                      />
                    ) : (
                      currentFolder?.bookmarks?.length === 0 && <EmptyState />
                    )}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* {bookmarks && bookmarks?.length > 30 && <ListLongImage />} */}
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
