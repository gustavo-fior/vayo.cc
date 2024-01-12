import * as ContextMenu from "@radix-ui/react-context-menu";
import { Cross1Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { itemVariants } from "../helpers/animationVariants";

export const ExpandedBookmark = ({
  bookmark,
  onRemove,
}: {
  bookmark: {
    createdAt: Date;
    id: string;
    title: string;
    url: string;
    faviconUrl: string | null;
    ogImageUrl: string | null;
  };
  onRemove?: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState("");

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <AnimatePresence mode="wait">
          <motion.li
            variants={itemVariants}
            key={bookmark.id}
            onMouseEnter={() => {
              setIsHovering(bookmark.id);
            }}
            onMouseLeave={() => setIsHovering("")}
            className={`relative border-y-8 border-transparent hover:cursor-pointer`}
            onClick={() => {
              window.open(bookmark.url, "_blank");
            }}
          >
            <AnimatePresence>
              {isHovering === bookmark.id && (
                <motion.div
                  transition={{ duration: 0.4 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layoutId="bookmark"
                  className="absolute left-0 top-0 h-full w-full rounded-lg bg-black/5 dark:bg-white/5"
                />
              )}
            </AnimatePresence>
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className={`z-10 flex justify-between rounded-lg px-3 py-2 transition duration-500 ease-in-out`}
            >
              <div className={`flex items-center gap-6 md:w-full`}>
                {bookmark.ogImageUrl &&
                !imageError &&
                bookmark.ogImageUrl !==
                  "https://raw.githubusercontent.com/spacedriveapp/.github/main/profile/spacedrive_icon.png" ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="hidden rounded-md md:block"
                  >
                    <Image
                      priority
                      src={String(bookmark.ogImageUrl)}
                      alt={bookmark.title}
                      width={320}
                      height={180}
                      className="hidden rounded-md md:block"
                      sizes="(max-width: 320px) 100vw, 320px"
                      style={{
                        height: "4rem",
                        width: "12rem",
                        objectFit: "cover",
                      }}
                      onError={handleImageError}
                    />
                  </motion.div>
                ) : bookmark.id !== "temp" ? (
                  <div
                    className="hidden rounded-md bg-gradient-to-br from-[#e0e0e0] to-[#dad7d7] dark:from-[#1a1a1a] dark:to-[#2d2c2c] md:block"
                    style={{
                      height: "4rem",
                      width: "12rem",
                    }}
                  />
                ) : (
                  <div
                    className="trasition hidden animate-pulse rounded-md bg-gradient-to-br from-[#bdbdbd] to-[#ececec] duration-100 ease-in-out dark:from-[#1a1a1a] dark:to-[#2d2c2c] md:block"
                    style={{
                      height: "4rem",
                      width: "12rem",
                    }}
                  />
                )}
                <div className="flex flex-col gap-2">
                  <motion.p
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-[16rem] truncate text-lg font-bold text-black dark:text-white sm:max-w-sm md:max-w-lg"
                  >
                    {bookmark.title}
                  </motion.p>
                  <div className="flex items-center gap-2 align-middle">
                    {bookmark.faviconUrl ? (
                      <Image
                        src={String(bookmark.faviconUrl)}
                        alt={bookmark.title}
                        width={12}
                        height={12}
                        className="rounded-sm"
                        style={{ height: "0.9rem", width: "0.9rem" }}
                        sizes="(max-width: 320px) 100vw, 48px"
                        priority
                      />
                    ) : (
                      <div
                        className="rounded-sm bg-gradient-to-br from-[#bdbdbd] to-[#ececec] dark:from-[#1a1a1a] dark:to-[#2d2c2c]"
                        style={{ height: "0.9rem", width: "0.9rem" }}
                      />
                    )}
                    <p className="w-64 truncate text-sm text-slate-500 sm:w-72 md:w-96 md:max-w-sm">
                      {bookmark.url}
                    </p>
                  </div>
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
                  className="z-50 pr-6 font-bold text-slate-500 duration-300 ease-in-out hover:text-black dark:hover:text-white"
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
        </AnimatePresence>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="rounded-md bg-white/10 px-4 py-2 align-middle text-white no-underline backdrop-blur-lg transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white/20">
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
