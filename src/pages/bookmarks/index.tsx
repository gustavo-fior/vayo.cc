import { type Bookmark } from "@prisma/client";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookmarksList } from "~/components/BookmarksList";
import { EmptyState } from "~/components/EmptyState";
import { Header } from "~/components/Header";
import { Separator } from "~/components/Separator";
import { SkeletonList } from "~/components/SkeletonList";
import { Spinner } from "~/components/Spinner";
import {
  bookmarksAtom,
  bookmarksFilteredAtom,
  currentFolderAtom,
  currentPageAtom,
  foldersAtom,
  isOpenAtom,
  showMonthsAtom,
  totalBookmarksAtom,
  viewStyleAtom,
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

  const inputRef = useRef(null);

  const [viewStyle] = useAtom(viewStyleAtom);
  const [showMonths] = useAtom(showMonthsAtom);

  const [filteredBookmarks, setFilteredBookmarks] = useAtom(
    bookmarksFilteredAtom
  );
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
  const [totalBookmarks, setTotalBookmarks] = useAtom(totalBookmarksAtom);
  const [, setFolders] = useAtom(foldersAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  const fetchFolders = api.folders.findByUserId.useQuery(
    {
      userId: String(session.data?.user.id),
    },
    {
      enabled: !!session.data?.user.id,
      onSuccess: (data) => {
        if (data && data?.length > 0) {
          setFolders(data);

          if (!currentFolder) {
            setCurrentFolder(data[0] ?? null);
            setBookmarks(data[0]?.bookmarks ?? null);
          } else {
            const currentFolderFromData = data.find(
              (folder) => folder.id === currentFolder?.id
            );

            setBookmarks(currentFolderFromData?.bookmarks ?? null);
          }

          setTimeout(() => {
            setIsOpen(true);
          }, 10);

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
      enabled: !!currentFolder,
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

            if (
              temps &&
              temps.length > 0 &&
              prevBookmarksWithoutTemp &&
              currentPage === 1
            ) {
              prevBookmarksWithoutTemp.unshift(...newBookmarks);
            } else {
              prevBookmarksWithoutTemp?.push(...newBookmarks);
            }

            return prevBookmarksWithoutTemp
              ? [...prevBookmarksWithoutTemp]
              : data.bookmarks;
          });

          setTotalBookmarks(data.totalElements);

          setTimeout(() => {
            setIsOpen(true);
          }, 10);
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
        if (
          bookmarks?.length !== totalBookmarks &&
          !fetchBookmarks.isLoading &&
          inputUrl.length === 0
        ) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bookmarks?.length,
    totalBookmarks,
    fetchBookmarks.isLoading,
    inputUrl.length,
  ]);

  // focus on input when ctrl/cmd + f is pressed
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();

        // Focus on the form
        if (inputRef.current) {
          (inputRef.current as HTMLFormElement).focus();
        }
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("keydown", handleKeyPress);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // filter bookmarks by search query
  useEffect(() => {
    // only filter if there is a search query and if the search query is not a url
    if (inputUrl.length > 0) {
      const filteredBookmarks = bookmarks?.filter((bookmark) => {
        return (
          bookmark.title.toLowerCase().includes(inputUrl.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(inputUrl.toLowerCase())
        );
      });

      setFilteredBookmarks(filteredBookmarks ?? []);
    } else {
      setFilteredBookmarks(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputUrl]);

  return (
    <>
      <Head>
        <title>{currentFolder?.name ?? "Bookmarks"}</title>
        <link rel="icon" href={getFaviconForFolder(currentFolder)} />
      </Head>
      <main className="relative min-h-screen w-full bg-[#e0e0e0] pt-8  dark:bg-[#161616]">
        <Header inputRef={inputRef} />
        <div className="flex flex-col items-center">
          <div className="w-[20rem]  sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
            <div className="pb-32">
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-12"
                onSubmit={(e) => {
                  e.preventDefault();

                  if (
                    inputUrl.length === 0 ||
                    addBookmark.isLoading ||
                    !currentFolder
                  ) {
                    return;
                  }

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
                <input
                  type="url"
                  name="url"
                  id="url"
                  ref={inputRef}
                  value={isDuplicate ? "Duplicate" : inputUrl}
                  disabled={addBookmark.isLoading || !currentFolder}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://... or ⌘F"
                  className={`/> w-full rounded-lg bg-black/10 px-4 py-2 font-semibold text-black no-underline placeholder-zinc-600 transition duration-200 ease-in-out placeholder:font-normal hover:bg-black/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10
                       ${
                         isDuplicate
                           ? "animate-shake ring-2 ring-red-500 focus:ring-red-500 focus:outline-none"
                           : "outline-zinc-500 focus:ring-zinc-500 focus:outline-none"
                       }`}
                />
              </motion.form>

              <div className={`mx-2 mt-6`}>
                <Separator />
              </div>

              <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
                className="flex flex-col gap-8"
              >
                <motion.ul className={`flex flex-col`}>
                  {!bookmarks && fetchBookmarks.isFetching && (
                    <SkeletonList viewStyle={viewStyle} />
                  )}

                  {bookmarks && bookmarks?.length > 0 && (
                    <BookmarksList
                      bookmarks={filteredBookmarks ?? bookmarks}
                      showMonths={showMonths}
                      viewStyle={viewStyle}
                      handleDeleteBookmark={handleDeleteBookmark}
                    />
                  )}

                  {totalBookmarks === 0 &&
                    bookmarks &&
                    bookmarks.length === 0 &&
                    fetchBookmarks.isFetched &&
                    fetchFolders.isFetched &&
                    isOpen && <EmptyState />}
                </motion.ul>
              </motion.div>
              <div className="flex justify-center pt-10 align-middle">
                {fetchBookmarks.isFetching &&
                  bookmarks &&
                  bookmarks?.length > 0 &&
                  inputUrl.length === 0 &&
                  currentPage > 1 && <Spinner size="md" />}
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
