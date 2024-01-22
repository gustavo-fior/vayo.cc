import { type Bookmark } from "@prisma/client";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
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
  totalBookmarksAtom,
  isOpenAtom,
  viewStyleAtom,
  showMonthsAtom,
  foldersAtom,
  bookmarksAtom,
} from "~/helpers/atoms";
import { capitalizeFirstLetter } from "~/helpers/capitalizeFirstLetter";
import { getCommonFavicons, getWebsiteName } from "~/helpers/getCommonFavicons";
import { getFaviconForFolder } from "~/helpers/getFaviconForFolder";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const session = useSession();
  const utils = api.useContext();

  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const [inputUrl, setInputUrl] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [viewStyle] = useAtom(viewStyleAtom);
  const [showMonths] = useAtom(showMonthsAtom);

  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
  const [totalBookmarks, setTotalBookmarks] = useAtom(totalBookmarksAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [currentPage, setCurrentPage] = useState(1);

  api.folders.findByUserId.useQuery(
    {
      userId: String(session.data?.user.id),
    },
    {
      onSuccess: (data) => {
        if (data && data?.length > 0) {
          setFolders(data);

          if (!currentFolder) {
            setCurrentFolder(data[0] ?? null);
          }

          void fetchBookmarks.refetch();
        }
      },
    }
  );

  const fetchBookmarks = api.bookmarks.findByFolderId.useQuery(
    {
      folderId: String(currentFolder?.id),
      page: currentPage,
    },
    {
      onSuccess: (data) => {
        if (data?.bookmarks) {
          setBookmarks((prevBookmarks) => {
            const newBookmarks = data.bookmarks.filter((bookmark) => {
              return !prevBookmarks?.find(
                (prevBookmark) => prevBookmark.id === bookmark.id
              );
            });

            const temps = prevBookmarks?.filter(
              (bookmark) => bookmark.id === "temp"
            );

            const prevBookmarksWithoutTemp = prevBookmarks?.filter(
              (bookmark) => bookmark.id !== "temp"
            );

            if (temps && temps.length > 0 && prevBookmarksWithoutTemp && currentPage === 1) {
              prevBookmarksWithoutTemp.unshift(...newBookmarks);
            } else {
              prevBookmarksWithoutTemp?.push(...newBookmarks);
            }

            return prevBookmarksWithoutTemp
              ? [...prevBookmarksWithoutTemp]
              : data.bookmarks;
          });

          setIsOpen(true);
          setTotalBookmarks(data.totalElements);
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

      bookmarks?.unshift(newBookmark);
    },
    onSettled: async () => {
      setCurrentPage(1);
      await fetchBookmarks.refetch();
    },
    onError: (context) => {
      const previousBookmarks =
        (
          context as {
            previousBookmarks?: {
              bookmarks: Bookmark[];
              totalElements: number;
            };
          }
        )?.previousBookmarks ?? null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolder?.id) },
        previousBookmarks!
      );
    },
  });

  const deleteBookmark = api.bookmarks.delete.useMutation({
    onMutate: ({ id }) => {
      const listWithoutDeletedBookmark = bookmarks?.filter(
        (bookmark) => bookmark.id !== id
      );

      if (listWithoutDeletedBookmark) {
        setBookmarks(listWithoutDeletedBookmark);
      }
    },
    onSettled: () => {
      void fetchBookmarks.refetch();
    },
    onError: (context) => {
      const previousBookmarks =
        (
          context as {
            previousBookmarks?: {
              bookmarks: Bookmark[];
              totalElements: number;
            };
          }
        )?.previousBookmarks ?? null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolder?.id) },
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

  // update page when scroll to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (bookmarks?.length !== totalBookmarks && !fetchBookmarks.isLoading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [bookmarks?.length, totalBookmarks, fetchBookmarks.isLoading]);

  return (
    <>
      <Head>
        <title>{currentFolder?.name ?? "Bookmarks"}</title>
        <link rel="icon" href={getFaviconForFolder(currentFolder)} />
      </Head>
      <main className="relative min-h-screen w-full bg-[#e0e0e0] dark:bg-[#161616]">
        <div className="flex flex-col items-center">
          <div className="w-[20rem]  sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
            <div className="pb-32 pt-16">
              <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 align-middle lg:flex-row lg:gap-0">
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();

                    if (
                      !currentFolder?.allowDuplicate &&
                      bookmarks?.find((bookmark) => bookmark.url === inputUrl)
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
                      className={`w-72 rounded-full bg-black/10 px-6 py-2 font-semibold text-black no-underline placeholder-slate-600 transition duration-200 ease-in-out placeholder:font-normal hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 md:w-96 ${
                        isDuplicate
                          ? "animate-shake ring-2 ring-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    <motion.button
                      whileTap={{
                        scale: 0.95,
                      }}
                      type="submit"
                      disabled={
                        inputUrl.length === 0 ||
                        addBookmark.isLoading ||
                        !currentFolder
                      }
                      className={`rounded-full bg-black/10 p-3 transition duration-200 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 ${
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-x-2 overflow-x-auto "
                >
                  {!folders ? (
                    [...Array<number>(3)].map((_, i) => (
                      <FolderSkeleton key={i} />
                    ))
                  ) : folders?.length > 0 ? (
                    folders.map((folder) => (
                      <motion.div
                        whileTap={{
                          scale: 0.95,
                        }}
                        onClick={() => {
                          if (
                            currentFolder?.id !== folder.id &&
                            folder.id !== "temp"
                          ) {
                            setCurrentFolder(folder);
                            setIsOpen(false);
                            setBookmarks(null);
                            setCurrentPage(0);
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
                  {folders && folders.length > 0 && <DeleteFolderButton />}
                  <CreateFolderButton />
                </div>
              </div>
              <motion.div
                initial={isOpen}
                animate={isOpen ? "open" : "closed"}
                className="flex flex-col gap-8"
              >
                <motion.ul className={`flex flex-col`}>
                  {!bookmarks && fetchBookmarks.isFetching ? (
                    <SkeletonList viewStyle={viewStyle} />
                  ) : bookmarks && bookmarks?.length > 0 ? (
                    <BookmarksList
                      bookmarks={bookmarks}
                      showMonths={showMonths}
                      viewStyle={viewStyle}
                      handleDeleteBookmark={handleDeleteBookmark}
                    />
                  ) : (
                    totalBookmarks === 0 &&
                    bookmarks &&
                    bookmarks.length === 0 &&
                    !fetchBookmarks.isFetching && <EmptyState />
                  )}
                </motion.ul>
              </motion.div>
              <div className="flex justify-center pt-10 align-middle">
                {fetchBookmarks.isFetching &&
                  bookmarks &&
                  bookmarks?.length > 0
                  && currentPage > 1
                  && <Spinner size="md" />}
              </div>
            </div>
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
