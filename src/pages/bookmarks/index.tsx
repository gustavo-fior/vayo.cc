import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import CompactBookmark from "~/components/CompactBookmark";
import { CompactSkeleton } from "~/components/CompactSkeleton";
import ExpandedBookmark from "~/components/ExpandedBookmark";
import { ExpandedSkeleton } from "~/components/ExpandedSkeleton";
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

  const { mutate, isLoading: creating } = api.bookmarks.create.useMutation({
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

    mutate({
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

  const handleChangeViewStyle = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(viewStyle === "compact" ? "expanded" : "compact");
  };

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBookmark(url);
                setUrl("");
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  name="url"
                  id="url"
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-96 rounded-full bg-white/10 px-6 py-2  font-semibold text-white no-underline placeholder-zinc-600 transition duration-300 hover:bg-white/20"
                />
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  type="submit"
                  disabled={url.length === 0 || creating}
                  className={`rounded-full bg-white/10 p-3 transition duration-300'hover:bg-white/20 ${url.length === 0 || creating ? "bg-white/5" : null}`}
                >
                  {creating ? (
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin fill-white dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                        stroke-width="2"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                        stroke-width="2"
                      />
                    </svg>
                  ) : (
                    <IoMdAdd color="white" size={16} strokeWidth={32} />
                  )}
                </motion.button>
              </div>
            </form>

            <div className="flex items-center gap-2 align-middle">
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
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                onClick={() => handleCopyToClipboard()}
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Share
              </motion.button>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => handleSignOut()}
              >
                <p>Sign out</p>
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
