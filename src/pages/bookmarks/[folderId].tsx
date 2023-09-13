import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { IoMdMenu } from "react-icons/io";
import CompactBookmark from "~/components/CompactBookmark";
import { CompactSkeleton } from "~/components/CompactSkeleton";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { ExpandedSkeleton } from "~/components/ExpandedSkeleton";
import { RectangleSkeleton } from "~/components/RectangleSkeleton";
import { ShareButton } from "~/components/ShareButton";
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

  console.log(folder);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="w-[20rem] py-16 sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <>
            <div className="flex items-center justify-between align-middle font-semibold text-white">
              <div>
                {folderLoading ? (
                  <RectangleSkeleton />
                ) : (
                  <div>
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
                  </div>
                )}
              </div>
              {folder?.isShared && (
                <div className="flex items-center gap-4 align-middle">
                  <motion.button
                    whileTap={{
                      scale: 0.8,
                    }}
                    onClick={() => handleChangeViewStyle()}
                    className="rounded-md bg-white/10 p-2 no-underline transition hover:bg-white/20"
                  >
                    {viewStyle === "compact" ? (
                      <IoMdMenu color="white" size={24} />
                    ) : (
                      <FiMenu color="white" size={24} />
                    )}
                  </motion.button>

                  <ShareButton />
                </div>
              )}
            </div>
            <div className="my-6 h-[2px] w-full rounded-full bg-white/5" />
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
                  {bookmarksLoading ? (
                    [...Array<number>(3)].map((_, i) =>
                      viewStyle === "compact" ? (
                        <CompactSkeleton key={i} />
                      ) : (
                        <ExpandedSkeleton key={i} />
                      )
                    )
                  ) : bookmarks && bookmarks?.length > 0 ? (
                    bookmarks?.map((bookmark) =>
                      viewStyle === "compact" ? (
                        <CompactBookmark
                          bookmark={bookmark}
                          key={bookmark.id}
                        />
                      ) : (
                        <ExpandedBookmark
                          bookmark={bookmark}
                          key={bookmark.id}
                        />
                      )
                    )
                  ) : (
                    <>
                      <Image
                        src="/images/hay.png"
                        className="mx-auto pt-12 opacity-80"
                        alt="hay"
                        width={200}
                        height={200}
                      />
                      <p
                        className={`text-center text-gray-500 ${
                          viewStyle === "compact" ? "pt-7" : "pt-4"
                        } italic`}
                      >
                        There are no bookmarks in this folder :/
                      </p>
                    </>
                  )}
                </motion.ul>
              </motion.div>
            )}
          </>
        </div>
      </main>
    </>
  );
}

