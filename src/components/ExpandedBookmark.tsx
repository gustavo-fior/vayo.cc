import { type Bookmark } from "@prisma/client";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Cross1Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { itemVariants } from "../helpers/animationVariants";
import { useState } from "react";

export const ExpandedBookmark = ({
  bookmark,
  onRemove,
}: {
  bookmark: Bookmark;
  onRemove?: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <motion.li variants={itemVariants} key={bookmark.id}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group flex justify-between rounded-lg p-2 transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 hover:drop-shadow-lg hover:backdrop-blur-lg"
          >
            <a
              className={`flex items-center gap-6 md:w-full`}
              href={bookmark.url}
              target="_blank"
            >
              {bookmark.ogImageUrl && !imageError ? (
                <Image
                  src={String(bookmark.ogImageUrl)}
                  alt={bookmark.title}
                  width={320}
                  height={180}
                  className="hidden rounded-md md:block"
                  priority
                  style={{
                    height: "4rem",
                    width: "12rem",
                    objectFit: "cover",
                  }}
                  onError={handleImageError}
                />
              ) : (
                <div
                  className="hidden rounded-md bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c] md:block"
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
                  {bookmark.faviconUrl ? (
                    <Image
                      src={String(bookmark.faviconUrl)}
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
                  <p className="w-72 truncate text-sm text-slate-500 md:w-96 md:max-w-sm">
                    {bookmark.url}
                  </p>
                </div>
              </div>
            </a>
            {onRemove && (
              <button
                className="z-10 pr-4 font-bold text-slate-500 opacity-0 transition duration-300 ease-in-out hover:text-white group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the click event from propagating
                  onRemove ? onRemove(bookmark.id) : null;
                }}
              >
                <Cross1Icon className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </motion.li>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="rounded-md bg-white/10 px-4 py-2 align-middle text-white no-underline backdrop-blur-lg transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white/20">
          <ContextMenu.Item
            className="text-white outline-none focus:outline-none"
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
