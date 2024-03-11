import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { type Bookmark, type Folder } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { type SetStateAction, useState } from "react";
import {
  bookmarksAtom,
  currentFolderAtom,
  foldersAtom,
  isNewFolderModalOpenAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Hotkey } from "./Hotkey";
import { Separator } from "./Separator";

export const CreateFolderForm = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [, setPopverOpen] = useState(false);
  const [, setFolders] = useAtom(foldersAtom);
  const [, setCurrentFolder] = useAtom(currentFolderAtom);
  const [, setBookmarks] = useAtom(bookmarksAtom);
  const [, setIsNewFolderModalOpen] = useAtom(isNewFolderModalOpenAtom);
  const session = useSession();
  const utils = api.useContext();
  const { theme } = useTheme();

  const { mutate: createFolder, isLoading: isCreatingFolder } =
    api.folders.create.useMutation({
      onSuccess: async (data) => {
        setCurrentFolder(data);
        setBookmarks([]);

        await utils.folders.findByUserId.invalidate({
          userId: String(session?.data?.user?.id),
        });
      },
      onError: () => {
        utils.folders.findByUserId.setData(
          { userId: String(session?.data?.user?.id) },
          (oldQueryData) => {
            return oldQueryData?.filter((folder) => folder.id !== "temp");
          }
        );
      },
    });

  const handleCreateFolder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newFolder: Folder & { bookmarks: Bookmark[] } = {
      id: "temp",
      name,
      icon,
      isShared: false,
      userId: String(session?.data?.user?.id),
      createdAt: new Date(),
      updatedAt: new Date(),
      allowDuplicate: true,
      bookmarks: [],
    };

    setFolders((oldFolders) => {
      if (!oldFolders) return null;
      return [newFolder, ...oldFolders];
    });

    createFolder({
      name,
      icon,
      userId: null,
    });

    setPopverOpen(false);

    setName("");
    setIcon("");

    return;
  };

  return (
    <motion.form
      className="flex flex-col gap-3 rounded-md bg-white/60 p-6 align-middle font-semibold text-black no-underline backdrop-blur-xl dark:bg-white/5 dark:text-white border-2 border-black/20 dark:border-white/10"
      onSubmit={(e) => {
        setIsNewFolderModalOpen(false);
        void handleCreateFolder(e);
      }}
    >
      <div className="flex flex-row items-center justify-between px-1 align-middle">
        <div className="flex flex-row items-center gap-2">
          <p className="text-lg font-semibold text-black dark:text-white">
            New folder
          </p>
          <Hotkey key1="n" />
        </div>
        <Dialog.Close asChild className=" cursor-pointer">
          <Cross1Icon className="h-4 w-4 text-zinc-500 transition duration-200 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300" />
        </Dialog.Close>
      </div>
      <Separator />
      <div className="flex flex-row mt-2 items-center gap-2 px-1 align-middle">
        <div className="flex flex-col">
          <label className="text-sm font-normal text-zinc-500">Icon</label>
          <div className="mt-1 flex flex-row items-center gap-2 align-middle  ">
            <Popover.Root
              onOpenChange={(open) => {
                setEmojiPickerOpen(open);
              }}
              open={emojiPickerOpen}
            >
              <Popover.Trigger asChild>
                <motion.input
                  type="text"
                  whileTap={{
                    scale: 0.95,
                  }}
                  value={icon}
                  className="w-10 rounded-md bg-black/10 py-1.5 text-center text-white placeholder-zinc-600 placeholder-opacity-50 outline-none focus:outline-none dark:bg-white/10"
                  placeholder="?"
                  readOnly
                />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content 
                
                sideOffset={35} side="left" align="end"
                className="z-[10001] mt-2 rounded-md font-semibold text-white no-underline h-[10rem] w-[300px] outline-none focus:outline-none">
                  <Picker
                    theme={theme === "dark" ? "dark" : "light"}
                    onEmojiSelect={(emojiData: { native: SetStateAction<string>; }) => {
                      setIcon(emojiData.native);
                      setEmojiPickerOpen(false);
                    }}
                    navPosition="none"
                    skinTonePosition="none"
                    searchPosition="none"
                    previewPosition="none"
                    autoFocus
                    data={data}
                    perLine={8}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{
                scale: 0.95,
              }}
              type="button"
              disabled={isCreatingFolder || icon.length === 0}
              className={`flex h-6 w-6 items-center justify-center rounded-md ${
                icon.length === 0
                  ? "bg-black/5 dark:bg-white/5"
                  : "bg-black/10 dark:bg-white/10"
              } p-1.5 align-middle font-semibold text-white no-underline transition duration-200 hover:bg-white/20`}
              onClick={() => setIcon("")}
            >
              <Cross1Icon
                className={`h-3 w-3 ${
                  icon.length === 0
                    ? "text-black/20 dark:text-white/20"
                    : "text-black dark:text-white"
                }`}
              />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col pl-2">
          <label className=" text-sm font-normal text-zinc-500">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md bg-black/10 px-3 py-2 text-sm font-normal text-black placeholder-zinc-600 dark:bg-white/10 dark:text-white"
            placeholder="Awesome refs"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <motion.button
        whileTap={{
          scale: 0.95,
        }}
        type="submit"
        disabled={isCreatingFolder}
        className={`${
          name.length > 0
            ? "bg-black/10 text-black dark:bg-white/10 dark:text-white"
            : "bg-black/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-600"
        } mt-2 rounded-md px-4 py-2 text-center align-middle font-semibold no-underline transition duration-200 hover:cursor-pointer`}
      >
        <p>Create</p>
      </motion.button>
    </motion.form>
  );
};
