import { type Bookmark } from "@prisma/client";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BookmarksList } from "~/components/BookmarksList";
import { CreateOrSearchBookmarkForm } from "~/components/CreateBookmarkForm";
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
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const session = useSession();
  const utils = api.useContext();

  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const [inputUrl, setInputUrl] = useState("");
  const inputUrlDebounced = useDebounce(inputUrl, 300);
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

  api.bookmarks.findByFolderId.useQuery(
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
        if (!data?.bookmarks) return;

        setBookmarks((prevBookmarks) => {
          if (!prevBookmarks) {
            return data.bookmarks;
          }

          const prevBookmarksIds = prevBookmarks.map((bookmark) => bookmark.id);

          const newBookmarks = data.bookmarks.filter(
            (bookmark) => !prevBookmarksIds.includes(bookmark.id)
          );

          const prevLocalBookmarks = prevBookmarks?.filter(
            (bookmark) => bookmark.new === true
          );

          const prevRemoteBookmarks = prevBookmarks?.filter(
            (bookmark) => !bookmark.new
          );

          if (
            prevLocalBookmarks.length > 0 &&
            prevRemoteBookmarks &&
            currentPage === 1
          ) {
            prevRemoteBookmarks.unshift(...newBookmarks);
          } else {
            prevRemoteBookmarks.push(...newBookmarks);
          }

          return prevRemoteBookmarks
            ? [...prevRemoteBookmarks]
            : data.bookmarks;
        });

        setTotalBookmarks(data.totalElements);

        setTimeout(() => {
          setIsOpen(true);
        }, 10);
      },
    }
  );

  const addBookmark = api.bookmarks.create.useMutation({
    onMutate: (data) => {
      const newBookmark: Bookmark = {
        id: data.url,
        url: data.url,
        title: capitalizeFirstLetter(getWebsiteName(data.url)),
        folderId: String(currentFolder?.id),
        faviconUrl: getCommonFavicons(data.url),
        ogImageUrl: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bookmarks?.unshift(newBookmark);
      setTotalBookmarks((prevTotal) => (prevTotal ? prevTotal + 1 : 1));
    },
    onSettled: (data) => {
      const previousPage = currentPage;

      setCurrentPage(1);

      setCurrentPage(previousPage);
    },
    onSuccess: (data) => {
      if (!data) {
        return;
      }

      setBookmarks((prevBookmarks) => {
        if (!prevBookmarks) {
          return [data];
        }

        return [
          data,
          ...prevBookmarks?.filter((bookmark) => bookmark.id !== data.url),
        ];
      });
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
    async ({ url }: { url: string }) => {
      if (url.length === 0 || !currentFolder) {
        return;
      }

      if (
        !currentFolder?.allowDuplicate &&
        bookmarks?.find((bookmark) => bookmark.url === url)
      ) {
        setIsDuplicate(true);

        setTimeout(() => {
          setIsDuplicate(false);
        }, 2000);

        return;
      }

      await addBookmark.mutateAsync({
        url,
        folderId: String(currentFolder?.id),
      });
    },
    [addBookmark, currentFolder?.id]
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

  function handleCleanUp() {
    setIsDuplicate(false);
    setFilteredBookmarks(null);
    setTotalBookmarks(bookmarks?.length ?? 0);
  }

  // filter bookmarks by search query
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length === 0) {
      handleCleanUp();
    }

    const filteredBookmarks = bookmarks?.filter((bookmark) => {
      return (
        bookmark.title.toLowerCase().includes(value.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(value.toLowerCase())
      );
    });

    setFilteredBookmarks(filteredBookmarks ?? []);
    setTotalBookmarks(filteredBookmarks?.length ?? 0);
  }

  return (
    <>
      <Head>
        <title>{currentFolder?.name ?? "Bookmarks"}</title>
        <link rel="icon" href={getFaviconForFolder(currentFolder)} />
      </Head>
      <main className="relative min-h-screen w-full bg-[#e0e0e0] pt-8  dark:bg-[#161616]">
        <Header inputRef={inputRef} />
        <div className="flex flex-col items-center">
          <div className="w-[20rem] pb-32 sm:w-[40rem] md:w-[48rem] lg:w-[50rem]">
            <CreateOrSearchBookmarkForm
              onSubmit={handleCreateBookmark}
              onCleanUp={handleCleanUp}
              onChange={handleInputChange}
              isLoading={addBookmark.isLoading}
              isDuplicate={isDuplicate}
            />

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
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  ((bookmarks && bookmarks.length === 0) ||
                    (filteredBookmarks && filteredBookmarks.length === 0)) &&
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
