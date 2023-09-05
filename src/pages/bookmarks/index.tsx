import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import CompactBookmark from "~/components/CompactBookmark";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { api } from "~/utils/api";

export default function Bookmarks() {
  const utils = api.useContext();
  const session = useSession();
  const [url, setUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [viewStyle, setViewStyle] = useState<"expanded" | "compact">(
    "expanded"
  );

  const handleSignOut = () => {
    signOut().catch((err) => console.error(err));
  };

  const create = api.bookmarks.create.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  // with optimistic updates
  const handleCreateBookmark = (url: string) => {
    const optimisticBookmark = {
      id: new Date().getTime().toString(), // Temporary ID
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: String(session.data?.user.id),
      url,
      title: "Loading...",
      favicon: "https://media0.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif",
      ogImage: "",
    };

    utils.bookmarks.findByUserId.setData({ userId: null }, (prev) => {
      prev?.push(optimisticBookmark);
      return prev;
    });

    create.mutate({
      url,
    });
  };

  const { data: bookmarks, isLoading } = api.bookmarks.findByUserId.useQuery({
    userId: String(session.data?.user.id),
  });

  const handleCopyToClipboard = () => {
    const url =
      window.location.hostname + "/bookmarks/" + session.data?.user.id;
    navigator.clipboard.writeText(url).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  useEffect(() => {
    if (!isLoading && bookmarks?.length) {
      setIsOpen(true);
    }
  }, [isLoading, bookmarks]);

  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-[#1a1a1a] to-[black] pt-32">
        <div className="w-[20rem] sm:w-[30rem] md:w-[40rem] lg:w-[50rem]">
          <div className="flex justify-between pb-16">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBookmark(url);
                setUrl("");
              }}
            >
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  name="url"
                  id="url"
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-96 rounded-full bg-white/10 px-6 py-2  font-semibold text-white no-underline placeholder-zinc-600 transition duration-300 hover:bg-white/20"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white/10 p-3 transition duration-300 hover:bg-white/20"
                >
                  <IoMdAdd color="white" size={16} strokeWidth={32} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4 align-middle">
              <button
                onClick={() =>
                  setViewStyle(viewStyle === "compact" ? "expanded" : "compact")
                }
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                {viewStyle === "compact" ? <p>Expanded</p> : <p>Compact</p>}
              </button>
              <button
                onClick={() => handleCopyToClipboard()}
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Share
              </button>
              <button
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => handleSignOut()}
              >
                <p>Sign out</p>
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
