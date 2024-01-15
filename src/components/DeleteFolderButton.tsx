import { Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  bookmarksAtom,
  currentFolderAtom,
  totalBookmarksAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Separator } from "./Separator";
import { Spinner } from "./Spinner";

export const DeleteFolderButton = () => {
  const session = useSession();
  const utils = api.useContext();
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [bookmarks] = useAtom(bookmarksAtom);
  const [popverOpen, setPopverOpen] = useState(false);
  const [totalBookmarks] = useAtom(totalBookmarksAtom);

  const { mutate: deleteFolder, isLoading: isDeletingFolder } =
    api.folders.delete.useMutation({
      onSuccess: async () => {
        await utils.bookmarks.findByFolderId.invalidate({
          folderId: currentFolder?.id,
        });
        await utils.folders.findByUserId.invalidate({
          userId: session?.data?.user?.id,
        });
      },
      onError: () => {
        utils.folders.findByUserId.setData(
          { userId: String(session?.data?.user?.id) },
          (oldQueryData) => {
            return oldQueryData?.filter(
              (folder) => folder.id !== currentFolder?.id
            );
          }
        );
      },
    });

  const handleDelete = async () => {
    const otherFolder =
      utils.folders.findByUserId.getData({
        userId: String(session?.data?.user?.id),
      })?.[0]?.id === currentFolder?.id
        ? utils.folders.findByUserId.getData({
            userId: String(session?.data?.user?.id),
          })?.[1]
        : utils.folders.findByUserId.getData({
            userId: String(session?.data?.user?.id),
          })?.[0];
    setCurrentFolder(otherFolder ?? null);

    await utils.folders.findByUserId.cancel();

    const previousFolders = utils.folders.findByUserId.getData();

    utils.folders.findByUserId.setData(
      { userId: String(session?.data?.user?.id) },
      (previousFolders) => [
        ...(previousFolders?.filter(
          (folder) => folder.id !== currentFolder?.id
        ) ?? []),
      ]
    );

    deleteFolder({
      id: String(currentFolder?.id),
    });

    return { previousFolders };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Popover.Root
        open={popverOpen}
        onOpenChange={(open) => {
          setPopverOpen(open);
        }}
      >
        <Popover.Trigger asChild>
          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="submit"
            disabled={isDeletingFolder}
            className="rounded-full bg-black/10 p-3.5 align-middle font-semibold text-black no-underline transition hover:cursor-pointer hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            onClick={() => {
              setPopverOpen(true);
            }}
          >
            {isDeletingFolder ? (
              <Spinner size="sm" />
            ) : (
              <Cross1Icon className="h-3 w-3 text-black dark:text-white" />
            )}
          </motion.button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-40 mr-6 md:mr-36">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="mt-4 flex w-72 flex-col gap-3 rounded-md bg-black/5 p-4 align-middle font-semibold text-black no-underline backdrop-blur-lg dark:bg-white/10 dark:text-white"
            >
              <div className="flex items-center justify-between gap-2 align-middle">
                <div className="flex items-center gap-2 px-1 align-middle">
                  <TrashIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                  <p>Delete folder</p>
                </div>
              </div>
              <Separator />
              <p className="px-1 text-xs font-normal text-gray-800 dark:text-gray-400">
                Are you sure? All{" "}
                <b className="text-black dark:text-white">{totalBookmarks}</b>{" "}
                bookmarks in this folder will be deleted...
              </p>
              <div className="flex w-full gap-2">
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  type="button"
                  className="w-full rounded-md bg-black/10 px-3 py-2 align-middle text-sm no-underline transition hover:cursor-pointer hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                  onClick={() => {
                    setPopverOpen(false);
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  type="button"
                  className="w-full rounded-md bg-red-500 px-3  py-2 align-middle text-sm font-normal no-underline transition hover:cursor-pointer hover:bg-red-600"
                  onClick={() => {
                    void handleDelete();
                    setPopverOpen(false);
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </motion.div>
  );
};
