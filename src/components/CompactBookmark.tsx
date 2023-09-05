import { type Bookmark } from "@prisma/client";
import { type Variants, motion } from "framer-motion";
import Image from "next/image";
import { api } from "~/utils/api";

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const CompactBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
  const utils = api.useContext();

  const remove = api.bookmarks.delete.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const handleDeleteBookmark = (id: string) => {
    // remove from cache
    utils.bookmarks.findByUserId.setData(undefined, (prev) => {
      prev?.filter((bookmark) => bookmark.id !== id);
      return prev;
    });

    // remove from server or rollback
    remove.mutate({
      id,
    });
  };

  return (
    <motion.li
      variants={itemVariants}
      key={bookmark.id}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      className="group flex justify-between rounded-lg p-2 transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 hover:drop-shadow-lg hover:backdrop-blur-lg"
    >
      <div>
        <a className="flex items-center gap-6" href={bookmark.url}>
          <div className="flex flex-row gap-4 items-center align-middle ">
              {bookmark.favicon && (
                <Image
                  src={String(bookmark.favicon)}
                  alt={bookmark.title}
                  width={12}
                  height={12}
                  className="rounded-sm"
                  style={{ height: "0.9rem", width: "0.9rem" }}
                />
              )}
            <p className="truncate font-semibold text-white">
              {bookmark.title}
            </p>
              <p className="max-w-sm truncate text-sm text-slate-500">
                {bookmark.url}
              </p>
          </div>
        </a>
      </div>
      <button
        className="group:hover:opacity-100 absolute z-10 pr-4 font-bold text-red-500 opacity-0 transition-opacity duration-300"
        onClick={() => handleDeleteBookmark(bookmark.id)}
      >
        x
      </button>
    </motion.li>
  );
};

export default CompactBookmark;
