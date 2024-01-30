import { Cross1Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import {
  currentFolderAtom,
  foldersAtom,
  totalBookmarksAtom,
  isDeleteFolderModalOpenAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Hotkey } from "./Hotkey";
import { Separator } from "@radix-ui/react-context-menu";

export const DeleteFolderForm = () => {
  const session = useSession();
  const utils = api.useContext();
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [, setIsDeleteFolderModalOpen] = useAtom(isDeleteFolderModalOpenAtom);
  const [totalBookmarks] = useAtom(totalBookmarksAtom);

  const { mutate: deleteFolder } = api.folders.delete.useMutation({
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
    const otherFolder = folders?.find(
      (folder) => folder.id !== currentFolder?.id
    );

    setFolders((oldFolders) => {
      if (!oldFolders) return null;
      return oldFolders?.filter((folder) => folder.id !== currentFolder?.id);
    });

    setCurrentFolder(otherFolder ?? null);

    if (otherFolder) {
      await utils.bookmarks.findByFolderId.refetch({
        folderId: otherFolder?.id,
      });
    }

    deleteFolder({
      id: String(currentFolder?.id),
    });

    return;
  };

  return (
    <motion.div className="flex flex-col gap-3 rounded-md bg-black/20 p-6 align-middle font-semibold text-black no-underline backdrop-blur-lg dark:bg-white/10 dark:text-white">
      <div className="flex flex-row items-center justify-between px-1 align-middle">
        <div className="flex flex-row items-center gap-2">
          <p className="text-lg font-semibold text-black dark:text-white">
            Delete folder
          </p>
          <Hotkey key1="x" />
        </div>
        <Dialog.Close asChild className=" cursor-pointer">
          <Cross1Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition duration-200" />
        </Dialog.Close>
      </div>
      <Separator />
      <p className="px-1 text-sm font-normal text-gray-800 dark:text-gray-400">
        Are you sure? All{" "}
        <b className="text-black dark:text-white">{totalBookmarks}</b> bookmarks
        in this folder will be deleted...
      </p>
      <div className="flex w-full gap-2 mt-4">
        <motion.button
          whileTap={{
            scale: 0.95,
          }}
          type="button"
          className="w-full rounded-md bg-black/10 px-4 py-2 align-middle text-md font-semibold no-underline transition duration-200 hover:cursor-pointer hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 outline-none focus:outline-none"
          onClick={() => {
            setIsDeleteFolderModalOpen(false);
          }}
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{
            scale: 0.95,
          }}
          type="button"
          className="w-full rounded-md bg-red-500 px-4 py-2 align-middle text-md font-normal no-underline transition duration-200 hover:cursor-pointer hover:bg-red-600"
          onClick={() => {
            setIsDeleteFolderModalOpen(false);
            void handleDelete();
          }}
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};
