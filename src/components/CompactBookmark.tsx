import { type Bookmark } from "@prisma/client";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { motion } from "framer-motion";
import Image from "next/image";
import { itemVariants } from "../helpers/animationVariants";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export const CompactBookmark = ({
  bookmark,
  onRemove,
}: {
  bookmark: Bookmark;
  onRemove?: (id: string) => void;
}) => {
  const [isHovering, setIsHovering] = useState("");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <motion.li
          variants={itemVariants}
          key={bookmark.id}
          onMouseEnter={() => {
            setIsHovering(bookmark.id);
          }}
          onMouseLeave={() => setIsHovering("")}
          className="relative border-b-4 border-transparent hover:cursor-pointer"
          onClick={() => {
            window.open(bookmark.url, "_blank");
          }}
        >
          {isHovering === bookmark.id && (
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.4 }}
              layoutId="bookmark"
              className="absolute left-0 top-0 h-full w-full rounded-lg bg-black/5 dark:bg-white/5"
            />
          )}
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="flex rounded-lg px-2 py-3 align-middle transition duration-500 ease-in-out md:px-4"
          >
            <div className="flex w-full items-center justify-between align-middle">
              <div className="z-10 flex flex-row items-center gap-3 align-middle">
                {bookmark.faviconUrl ? (
                  <div className="min-h-[1.9rem] min-w-[1.9rem] rounded-lg bg-black/10 p-2 dark:bg-white/10">
                    <Image
                      src={String(bookmark.faviconUrl)}
                      alt={bookmark.title}
                      width={12}
                      height={12}
                      sizes="24px"
                      style={{
                        height: "0.9rem",
                        width: "0.9rem",
                        borderRadius: "0.2rem",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-lg bg-gradient-to-br from-[#d2d1d1] to-[#dad7d7] dark:from-[#1a1a1a] dark:to-[#2d2c2c]"
                    style={{ height: "1.9rem", width: "1.9rem" }}
                  />
                )}
                <motion.p
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`max-w-[16rem] truncate font-semibold text-black dark:text-white sm:max-w-xs md:max-w-sm`}
                >
                  {bookmark.title}
                </motion.p>
                <p className="hidden w-72 truncate text-sm text-slate-500 md:block">
                  {bookmark.url}
                </p>
              </div>
            </div>
            {onRemove && bookmark.id !== "temp" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                animate={
                  isHovering
                    ? { opacity: 1, transition: { delay: 0.5 } }
                    : { opacity: 0 }
                }
                exit={{ opacity: 0 }}
                className="z-50 pr-1 font-bold text-slate-500 duration-300 ease-in-out hover:text-black dark:hover:text-white"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the click event from propagating
                  onRemove ? onRemove(bookmark.id) : null;
                }}
              >
                <Cross1Icon className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        </motion.li>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="rounded-md bg-black/10 px-4 py-2 align-middle no-underline backdrop-blur-lg transition duration-300 ease-in-out hover:cursor-pointer hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20">
          <ContextMenu.Item
            className="text-black outline-none focus:outline-none dark:text-white"
            onClick={() => {
              void navigator.clipboard.writeText(bookmark.url);
            }}
          >
            <p>Copy link</p>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
