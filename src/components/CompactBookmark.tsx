import { type Bookmark } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "~/utils/api";
import { itemVariants } from "../helpers/animationVariants";
import { useSession } from "next-auth/react";

const CompactBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
  const utils = api.useContext();
  const { data } = useSession();

  const remove = api.bookmarks.delete.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const handleDeleteBookmark = (id: string) => {
    remove.mutate({
      id,
    });
  };

  return (
    <motion.li variants={itemVariants} key={bookmark.id}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex rounded-lg px-4 py-3 align-middle transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 hover:drop-shadow-lg hover:backdrop-blur-lg"
      >
        <a
          className="flex  w-full items-center justify-between align-middle"
          href={bookmark.url}
          target="_blank"
        >
          <div className="flex flex-row items-center gap-3 align-middle ">
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
            <p className={`${data && data.user.id === bookmark.userId ? "max-w-xs" : 'max-w-sm'} truncate font-semibold text-white `}>
              {bookmark.title}
            </p>
            <p className="max-w-xs truncate text-sm text-slate-500">
              {bookmark.url}
            </p>
          </div>
        </a>
        {data && data.user.id === bookmark.userId && (
          <button
            className="z-10 font-bold text-slate-500 opacity-0 transition duration-300 ease-in-out hover:text-white group-hover:opacity-100"
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
        )}
      </motion.div>
    </motion.li>
  );
};

export default CompactBookmark;