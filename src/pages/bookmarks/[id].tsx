import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CompactBookmark from "~/components/CompactBookmark";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { api } from "~/utils/api";

export default function BookmarksByUser() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">(
    "expanded"
  );

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
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black] pt-32">
        <div className="w-[20rem] sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <div className="flex justify-end pb-8">
            <div className="flex items-center gap-4 align-middle">
              <button
                onClick={() =>
                  setViewStyle(viewStyle === "compact" ? "expanded" : "compact")
                }
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                {viewStyle === "compact" ? <p>Expanded</p> : <p>Compact</p>}
              </button>
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
              {isLoading ? (
                <p className="text-white">Loading... TODO: Skeleton</p>
              ) : (
                bookmarks?.map((bookmark) =>
                  viewStyle === "compact" ? (
                    <CompactBookmark bookmark={bookmark} key={bookmark.id} />
                  ) : (
                    <ExpandedBookmark bookmark={bookmark} key={bookmark.id} />
                  )
                )
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
