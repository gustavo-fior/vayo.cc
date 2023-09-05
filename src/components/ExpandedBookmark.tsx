import { type Bookmark } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "~/utils/api";
import { itemVariants } from "../helpers/animationVariants";

const ExpandedBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
  const utils = api.useContext();

  const remove = api.bookmarks.delete.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const handleDeleteBookmark = (id: string) => {
    // remove from cache
    utils.bookmarks.findByUserId.setData({ userId: null }, (prev) => {
      prev?.filter((bookmark) => bookmark.id !== id);
      return prev;
    });

    // remove from server or rollback
    remove.mutate({
      id,
    });
  };

  return (
    <motion.li variants={itemVariants} key={bookmark.id}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group flex justify-between rounded-lg p-2 transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 hover:drop-shadow-lg hover:backdrop-blur-lg"
      >
        <a
          className="flex items-center gap-6"
          href={bookmark.url}
          target="_blank"
        >
          {bookmark.ogImage ? (
            <Image
              src={String(bookmark.ogImage)}
              alt={bookmark.title}
              width={320}
              height={180}
              className="rounded-md"
              style={{
                height: "4rem",
                width: "12rem",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="rounded-md bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c]"
              style={{
                height: "4rem",
                width: "12rem",
              }}
            />
          )}
          <div className="flex flex-col gap-2">
            <p className="max-w-lg truncate text-lg font-bold text-white">
              {bookmark.title}
            </p>
            <div className="flex items-center gap-2 align-middle">
              {bookmark.favicon ? (
                <Image
                  src={String(bookmark.favicon)}
                  alt={bookmark.title}
                  width={12}
                  height={12}
                  className="rounded-sm"
                  style={{ height: "0.9rem", width: "0.9rem" }}
                />
              ) : (
                <div
                  className="rounded-sm bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c]"
                  style={{ height: "0.9rem", width: "0.9rem" }}
                />
              )}
              <p className="max-w-sm truncate text-sm text-slate-500">
                {bookmark.url}
              </p>
            </div>
          </div>
        </a>
        <button
          className="z-10 pr-4 font-bold text-slate-500 opacity-0 transition duration-300 ease-in-out hover:text-white group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the click event from propagating
            handleDeleteBookmark(bookmark.id);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </motion.div>
    </motion.li>
  );
};

export default ExpandedBookmark;
