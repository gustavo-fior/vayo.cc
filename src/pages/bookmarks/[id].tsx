import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CompactBookmark from "~/components/CompactBookmark";
import { CompactSkeleton } from "~/components/CompactSkeleton";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { ExpandedSkeleton } from "~/components/ExpandedSkeleton";
import { api } from "~/utils/api";

export default function BookmarksByUser() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const { data: owner, isLoading: loadingOwner } =
    api.users.findByUserId.useQuery({ userId: String(id) });

  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">(
    "expanded"
  );

  const handleChangeViewStyle = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(viewStyle === "compact" ? "expanded" : "compact");
  };

  const { data: bookmarks, isLoading } = api.bookmarks.findByUserId.useQuery({
    userId: String(id),
  });

  useEffect(() => {
    if (!isLoading && bookmarks?.length) {
      setIsOpen(true);
    }
  }, [isLoading, bookmarks]);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <div className="w-[20rem] py-16 sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <div className="flex items-center justify-between align-middle">
            <div className="flex w-full items-center justify-between gap-2 align-middle">
              <Image
                src="/images/logo.png"
                alt="logo"
                width={64}
                height={64}
                className="h-[1.8rem] w-[1.8rem]"
              />
              <h1 className="text-2xl font-semibold text-white">
                {!loadingOwner ? `${owner?.name}'s bookmarks` : "Loading..."}
              </h1>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                onClick={() => handleChangeViewStyle()}
                className="rounded-full bg-white/10 p-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                {viewStyle === "compact" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    className="h-6 w-6"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="white"
                      stroke-width="8"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="white"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
          <div className="my-6 h-[2px] w-full rounded-full bg-white/5" />
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
              {isLoading
                ? [...Array<number>(3)].map((_, i) =>
                    viewStyle === "compact" ? (
                      <CompactSkeleton key={i} />
                    ) : (
                      <ExpandedSkeleton key={i} />
                    )
                  )
                : bookmarks?.map((bookmark) =>
                    viewStyle === "compact" ? (
                      <CompactBookmark bookmark={bookmark} key={bookmark.id} />
                    ) : (
                      <ExpandedBookmark bookmark={bookmark} key={bookmark.id} />
                    )
                  )}
            </motion.ul>
          </motion.div>
        </div>
      </main>
    </>
  );
}
