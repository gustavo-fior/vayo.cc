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
  totalBookmarksAtom,
} from "~/helpers/atoms";
import { capitalizeFirstLetter } from "~/helpers/capitalizeFirstLetter";
import { getCommonFavicons, getWebsiteName } from "~/helpers/getCommonFavicons";
import { getFaviconForFolder } from "~/helpers/getFaviconForFolder";
import { isValidURL } from "~/helpers/isValidURL";
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const session = useSession();
  const utils = api.useContext();

  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const [inputUrl, setInputUrl] = useState("");
  const inputUrlDebounced = useDebounce(inputUrl, 50);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const inputRef = useRef(null);

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
            const currentFolderId = localStorage.getItem("currentFolderId");

            if (currentFolderId) {
              const currentFolderFromData = data.find(
                (folder) => folder.id === currentFolderId
              );

              setCurrentFolder(currentFolderFromData ?? null);
              setBookmarks(currentFolderFromData?.bookmarks ?? null);
            } else {
              setCurrentFolder(data[0] ?? null);
              setBookmarks(data[0]?.bookmarks ?? null);
            }
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

  const fetchBookmarsWithSearch = api.bookmarks.findByFolderId.useQuery(
    {
      folderId: String(currentFolder?.id),
      search: inputUrlDebounced,
    },
    {
      enabled: !!currentFolder && inputUrlDebounced.length > 0,
      onSuccess: (data) => {
        if (data?.bookmarks) {
          setFilteredBookmarks(data.bookmarks);
          setTotalBookmarks(data.bookmarks.length);

          setTimeout(() => {
            setIsOpen(true);
          }, 10);
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
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bookmarks?.unshift(newBookmark);
      setTotalBookmarks((prevTotal) => (prevTotal ? prevTotal + 1 : 1));
    },
    onSettled: async () => {
      const previousPage = currentPage;

      setCurrentPage(1);
      await fetchBookmarks.refetch();

      setCurrentPage(previousPage);
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
      if (filteredBookmarks && filteredBookmarks.length > 0) {
        const listWithoutDeletedBookmark = filteredBookmarks.filter(
          (bookmark) => bookmark.id !== id
        );

        if (listWithoutDeletedBookmark) {
          setFilteredBookmarks(listWithoutDeletedBookmark);
          setTotalBookmarks((prevTotal) => (prevTotal ? prevTotal - 1 : 0));
        }
      }

      const listWithoutDeletedBookmark = bookmarks?.filter(
        (bookmark) => bookmark.id !== id
      );

      if (listWithoutDeletedBookmark) {
        setBookmarks(listWithoutDeletedBookmark);
        setTotalBookmarks((prevTotal) => (prevTotal ? prevTotal - 1 : 0));
      }

      // didn't like it 
      //
      // toast("Bookmark deleted", {
      //   position: "top-center",
      //   duration: 1500,
      //   style: {
      //     borderRadius: "16px",
      //     color: resolvedTheme === "dark" ? "white" : "black",
      //     border: resolvedTheme === "dark" ? "1px solid #262626" : "1px solid #a3a3a3",
      //     backgroundColor: resolvedTheme === "dark" ? "#171717" : "#d4d4d4",
      //     fontFamily: "Inter",
      //     fontWeight: "500",
      //   },
      // });
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

  const handleCreateBookmark = useCallback(
    (url?: string) => {
      addBookmark.mutate({
        url: url ?? inputUrl,
        folderId: String(currentFolder?.id),
      });
    },
    [addBookmark, inputUrl, currentFolder?.id]
  );

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
          inputUrl.length === 0 // TODO: fix this
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

  // focus on input when ctrl/cmd + f
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();

        if (inputRef.current) {
          (inputRef.current as HTMLFormElement).focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

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
      setTotalBookmarks(filteredBookmarks?.length ?? 0);
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
      <main className="relative min-h-screen w-full bg-[#e0e0e0] pt-8 dark:bg-[#111111]">
        <Header inputRef={inputRef} />
        <div className="flex flex-col items-center">
          <div className="w-[20rem] pb-32 sm:w-[40rem] md:w-[48rem] lg:w-[50rem]">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative mx-4 mt-8 md:mx-12"
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
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text/plain");

                  if (
                    text.length === 0 ||
                    inputUrl.length > 0 ||
                    !isValidURL(text)
                  ) {
                    return;
                  }

                  setInputUrl(text);

                  if (
                    !currentFolder?.allowDuplicate &&
                    bookmarks?.find((bookmark) => bookmark.url === text)
                  ) {
                    setIsDuplicate(true);

                    setTimeout(() => {
                      setInputUrl(text);

                      setIsDuplicate(false);
                    }, 2000);

                    return;
                  }

                  handleCreateBookmark(text);
                }}
                placeholder="https://... or ⌘F"
                className={`w-full rounded-lg border border-black/10 bg-black/10 px-4  py-2 font-semibold text-black no-underline placeholder-zinc-600 transition duration-200 ease-in-out placeholder:font-normal hover:bg-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 
                  ${
                    isDuplicate
                      ? "animate-shake ring-2 ring-red-500 focus:outline-none focus:ring-red-500"
                      : "outline-zinc-500 focus:outline-none focus:ring-zinc-500"
                  }`}
              />
              {addBookmark.isLoading && (
                <motion.div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                  <Spinner size="md" />
                </motion.div>
              )}
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
                {!bookmarks && fetchBookmarks.isFetching && <SkeletonList />}

                {bookmarks && bookmarks?.length > 0 && (
                  <BookmarksList
                    bookmarks={filteredBookmarks ?? bookmarks}
                    handleDeleteBookmark={handleDeleteBookmark}
                  />
                )}

                {totalBookmarks === 0 &&
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  ((bookmarks && bookmarks.length === 0) ||
                    (filteredBookmarks && filteredBookmarks.length === 0)) &&
                  fetchBookmarks.isFetched &&
                  fetchFolders.isFetched &&
                  !isDuplicate &&
                  fetchBookmarsWithSearch.isFetched &&
                  !fetchBookmarsWithSearch.isLoading && <EmptyState />}
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
