import { type Bookmark } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { showMonthsAtom, viewStyleAtom } from "~/helpers/atoms";
import { CompactBookmark } from "./CompactBookmark";
import { ExpandedBookmark } from "./ExpandedBookmark";
import { useAtom } from "jotai";

export const BookmarksList = ({
  bookmarks,
  handleDeleteBookmark,
}: {
  bookmarks: Bookmark[];
  handleDeleteBookmark: (id: string) => void;
}) => {
  const [viewStyle] = useAtom(viewStyleAtom);
  const [includeMonths] = useAtom(showMonthsAtom);

  let groupedBookmarks: Record<string, Bookmark[]> = {};

  if (includeMonths) {
    groupedBookmarks = bookmarks.reduce((result, current) => {
      const date = new Date(current.createdAt);
      const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        date
      );
      if (!result[month]) {
        result[month] = [];
      }
      result[month]?.push(current);
      return result;
    }, {} as Record<string, Bookmark[]>);
  }

  return includeMonths ? (
    groupedBookmarks && (
      <>
        {Object.keys(groupedBookmarks).map((month) => (
          <motion.div key={month}>
            <motion.div>
              {viewStyle === "compact" ? (
                <motion.h3
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="pb-2 pl-2 pt-4 text-2xl font-bold text-black dark:text-white"
                >
                  {month}
                </motion.h3>
              ) : (
                <motion.h2
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="pb-2 pl-2 pt-4 text-2xl font-bold text-black dark:text-white"
                >
                  {month}
                </motion.h2>
              )}
            </motion.div>
            <AnimatePresence mode="wait">
              {groupedBookmarks[month]?.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  id={bookmark.id}
                  initial={{
                    opacity: bookmark.id === "temp" ? 0 : 1,
                    y: bookmark.id === "temp" ? -10 : 0,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  exit={{ opacity: 0, y: -10 }}
                  
                >
                  {viewStyle === "compact" ? (
                    <CompactBookmark
                      onRemove={handleDeleteBookmark}
                      bookmark={bookmark}
                    />
                  ) : (
                    <ExpandedBookmark
                      onRemove={handleDeleteBookmark}
                      bookmark={bookmark}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ))}
      </>
    )
  ) : (
    <div className="pt-4">
      {bookmarks.map((bookmark) => (
        <motion.div
          key={bookmark.id}
          id={bookmark.id}
          initial={{
            opacity: bookmark.id === "temp" ? 0 : 1,
            y: bookmark.id === "temp" ? -10 : 0,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {viewStyle === "compact" ? (
            <CompactBookmark
              onRemove={handleDeleteBookmark}
              bookmark={bookmark}
            />
          ) : (
            <ExpandedBookmark
              onRemove={handleDeleteBookmark}
              bookmark={bookmark}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
