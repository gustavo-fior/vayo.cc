import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { IoMdMenu } from "react-icons/io";
import CompactBookmark from "~/components/CompactBookmark";
import { EmptyState } from "~/components/EmptyState";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { RectangleSkeleton } from "~/components/RectangleSkeleton";
import { ShareLinkButton } from "~/components/ShareLinkButton";
import { SkeletonList } from "~/components/SkeletonList";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const router = useRouter();
  const { folderId } = router.query;
  const [isOpen, setIsOpen] = useState(false);
  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">(
    "expanded"
  );

  const { data: folder, isLoading: folderLoading } =
    api.folders.findById.useQuery({
      id: String(folderId),
    });

  if (folder?.isShared) {
  }
  const { data: bookmarks, isLoading: bookmarksLoading } =
    api.bookmarks.findByFolderId.useQuery({
      folderId: String(folderId),
      direction: "asc",
    });

  const handleChangeViewStyle = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(viewStyle === "compact" ? "expanded" : "compact");
  };

  useEffect(() => {
    if (!bookmarksLoading && bookmarks?.length && !folderLoading) {
      setIsOpen(true);
    }
  }, [bookmarksLoading, bookmarks, folderLoading]);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="w-[20rem] py-16 sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <AnimatePresence mode="popLayout">
            <div className="flex items-center justify-between px-2 align-middle font-semibold text-white">
              {folderLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RectangleSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="loaded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {folder?.isShared ? (
                    <div className="flex items-center gap-3 align-middle">
                      <p className="text-3xl">{folder?.icon}</p>
                      <p className="text-3xl">{folder?.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 align-middle">
                      <p className="text-3xl">This folder is private :/</p>
                    </div>
                  )}
                </motion.div>
              )}
              {folder?.isShared && (
                <div className="flex items-center gap-2 align-middle">
                  <motion.button
                    key="loaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{
                      scale: 0.8,
                    }}
                    onClick={() => handleChangeViewStyle()}
                    className="rounded-full bg-white/10 p-3 no-underline transition hover:bg-white/20"
                  >
                    {viewStyle === "compact" ? (
                      <IoMdMenu color="white" size={18} />
                    ) : (
                      <FiMenu color="white" size={18} />
                    )}
                  </motion.button>
                  <motion.div
                    key="loaded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ShareLinkButton />
                  </motion.div>
                </div>
              )}
            </div>
          </AnimatePresence>
          <div className="my-6 h-[2px] w-full rounded-full bg-white/5" />
          {bookmarksLoading && <SkeletonList viewStyle={viewStyle} />}
          {folder?.isShared && (
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
                {bookmarks && bookmarks?.length > 0 ? (
                  bookmarks?.map((bookmark) =>
                    viewStyle === "compact" ? (
                      <CompactBookmark bookmark={bookmark} key={bookmark.id} />
                    ) : (
                      <ExpandedBookmark bookmark={bookmark} key={bookmark.id} />
                    )
                  )
                ) : (
                  <EmptyState />
                )}
              </motion.ul>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
