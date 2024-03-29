import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import {
  currentFolderAtom,
  foldersAtom,
  isDeleteFolderModalOpenAtom,
  totalBookmarksAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Hotkey } from "./Hotkey";
import { Separator } from "./Separator";

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

  const handleDelete = () => {
    const otherFolder = folders?.find(
      (folder) => folder.id !== currentFolder?.id
    );

    setFolders((oldFolders) => {
      if (!oldFolders) return null;
      return oldFolders?.filter((folder) => folder.id !== currentFolder?.id);
    });

    setCurrentFolder(otherFolder ?? null);

    deleteFolder({
      id: String(currentFolder?.id),
    });

    return;
  };

  return (
    <motion.div className="flex flex-col gap-3 rounded-md border-2 border-black/20 bg-white/60 p-6 align-middle font-semibold text-black no-underline backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
      <div className="flex flex-row items-center justify-between px-1 align-middle">
        <div className="flex flex-row items-center gap-2">
          <p className="text-lg font-semibold text-black dark:text-white">
            Delete folder
          </p>
          <Hotkey key1="x" />
        </div>
        <Dialog.Close asChild className=" cursor-pointer">
          <div className="rounded-md p-1.5 text-zinc-500 transition duration-200 hover:bg-black/10 hover:text-zinc-600 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-300">
            <Cross1Icon className="h-4 w-4"/>
          </div>
        </Dialog.Close>
      </div>
      <Separator />
      <p className="mt-1 px-1 text-sm font-normal text-zinc-500">
        Are you sure? All{" "}
        <b className="text-black dark:text-white">{totalBookmarks}</b> bookmarks
        in this folder will be deleted...
      </p>
      <div className="mt-4 flex w-full gap-2">
        <motion.button
          whileTap={{
            scale: 0.95,
          }}
          type="button"
          className="text-md w-full rounded-md bg-black/10 px-4 py-2 align-middle font-semibold no-underline outline-none transition duration-200 hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:bg-white/10 dark:hover:bg-white/20"
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
          className="text-md w-full rounded-md bg-red-500 px-4 py-2 align-middle font-normal no-underline transition duration-200 hover:cursor-pointer hover:bg-red-600"
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
