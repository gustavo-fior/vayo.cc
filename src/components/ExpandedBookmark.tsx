import * as ContextMenu from "@radix-ui/react-context-menu";
import { Cross1Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { itemVariants } from "../helpers/animationVariants";
import { Spinner } from "./Spinner";
import { ContextMenuContent } from "./ContextMenuContent";
import { type Bookmark } from "@prisma/client";

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
    loading?: boolean;
    onClick?: () => void;
  };
  onRemove?: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isHovering, setIsHovering] = useState("");

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
            className={`hover:cursor-pointer`}
            onClick={() => {
              if (bookmark.onClick) {
                bookmark.onClick();
                return;
              }

              window.open(bookmark.url, "_blank");
            }}
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              className={`flex justify-between rounded-xl hover:bg-black/5 hover:dark:bg-white/5 p-3 mb-2 transition duration-200 ease-in-out`}
            >
              <div className={`flex items-center gap-6 md:w-full`}>
                {bookmark.loading ? (
                  <motion.div className="min-h-[1.9rem] min-w-[1.9rem] rounded-lg bg-black/10 p-2 dark:bg-white/10">
                    <Spinner size="md" />
                  </motion.div>
                ) : bookmark.ogImageUrl && !imageError ? (
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
                      onError={() => {
                        setImageError(true);
                      }}
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
                <div className="flex flex-col gap-2 sm:pl-2 md:pl-0">
                  <motion.p
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="lg:max-w-[30rem] md:max-w-[24rem] sm:max-w-[24rem] max-w-[15rem] truncate text-lg font-bold text-black dark:text-white"
                  >
                    {bookmark.title}
                  </motion.p>
                  <div className="flex items-center gap-2 align-middle">
                    {bookmark.faviconUrl ? (
                      <Image
                        src={
                          faviconError
                            ? "/images/logo.png"
                            : bookmark.faviconUrl
                        }
                        alt={bookmark.title}
                        width={12}
                        height={12}
                        className="rounded-sm"
                        style={{ height: "0.9rem", width: "0.9rem" }}
                        sizes="(max-width: 320px) 100vw, 48px"
                        priority
                        onError={() => {
                          setFaviconError(true);
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-sm bg-gradient-to-br from-[#bdbdbd] to-[#ececec] dark:from-[#1a1a1a] dark:to-[#2d2c2c]"
                        style={{ height: "0.9rem", width: "0.9rem" }}
                      />
                    )}
                    <p className="w-48 truncate text-sm text-zinc-500 sm:w-72 md:w-96 md:max-w-sm">
                      {bookmark.url}
                    </p>
                  </div>
                </div>
              </div>
              {onRemove && bookmark.id !== "temp" && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  animate={
                    isHovering
                      ? { opacity: 1, transition: { delay: 0.2 } }
                      : { opacity: 0 }
                  }
                  exit={{ opacity: 0 }}
                  className="z-50 lg:pr-6 pr-4 font-bold text-zinc-500 duration-300 ease-in-out hover:text-black dark:hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove ? onRemove(bookmark.id) : null;
                  }}
                >
                  <Cross1Icon className="h-5 w-5" />
                </motion.button>
              )}
            </motion.div>
          </motion.li>
        </AnimatePresence>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenuContent bookmark={bookmark as Bookmark} setIsEditing={() => {
          return;
        }} />
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
