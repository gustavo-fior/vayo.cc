import { type Folder } from "@prisma/client";
import { Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Spinner } from "./Spinner";
import { useAtom } from "jotai";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { currentFolderAtom } from "~/helpers/atoms";
import { Separator } from "./Separator";

export const DeleteFolderButton = () => {
  const session = useSession();
  const utils = api.useContext();
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [popverOpen, setPopverOpen] = useState(false);

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
          (oldQueryData: Folder[] | undefined) => {
            return oldQueryData?.filter(
              (folder) => folder.id !== currentFolder?.id
            );
          }
        );
      },
    });

  const handleDelete = async () => {

    const otherFolder = utils.folders.findByUserId.getData({ userId: String(session?.data?.user?.id) })?.[0]?.id === currentFolder?.id ? utils.folders.findByUserId.getData({ userId: String(session?.data?.user?.id) })?.[1] : utils.folders.findByUserId.getData({ userId: String(session?.data?.user?.id) })?.[0];
    setCurrentFolder(otherFolder ?? null);

    await utils.folders.findByUserId.cancel();

    const previousFolders = utils.folders.findByUserId.getData();

    utils.folders.findByUserId.setData(
      { userId: String(session?.data?.user?.id) },
      (previousFolders: Folder[] | undefined) =>
        [
          ...(previousFolders?.filter(
            (folder) => folder.id !== currentFolder?.id
          ) ?? []),
        ] as Folder[]
    );

    deleteFolder({
      id: String(currentFolder?.id),
    });

    return { previousFolders };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
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
              scale: 0.8,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="submit"
            disabled={isDeletingFolder}
            className="rounded-full dark:bg-white/10 bg-black/10 p-3 align-middle font-semibold dark:text-white text-black no-underline transition hover:cursor-pointer hover:bg-black/20 dark:hover:bg-white/20"
            onClick={() => {
              setPopverOpen(true);
            }}
          >
            {isDeletingFolder ? (
              <Spinner size="sm" />
            ) : (
              <Cross1Icon className="h-4 w-4 dark:text-white text-black" />
            )}
          </motion.button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-40 md:mr-36 mr-6">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="mt-4 flex w-72 flex-col gap-3 rounded-md dark:bg-white/10 bg-black/5 p-4 align-middle font-semibold dark:text-white text-black no-underline backdrop-blur-lg"
            >
              <div className="flex items-center justify-between gap-2 align-middle">
                <div className="flex items-center gap-2 align-middle px-1">
                  <TrashIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                  <p>Delete folder</p>
                </div>
              </div>
              <Separator />
              <p className="text-xs font-normal dark:text-gray-400 text-gray-800 px-1">
                Are you sure? All bookmarks in this folder will be deleted...
              </p>
              <div className="flex gap-2 w-full">
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  type="button"
                  className="rounded-md dark:bg-white/10 bg-black/10 px-3 py-2 w-full align-middle text-sm no-underline transition hover:cursor-pointer dark:hover:bg-white/20 hover:bg-black/20"
                  onClick={() => {
                    setPopverOpen(false);
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  type="button"
                  className="rounded-md bg-red-500 px-3 py-2  align-middle w-full text-sm font-normal no-underline transition hover:cursor-pointer hover:bg-red-600"
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
