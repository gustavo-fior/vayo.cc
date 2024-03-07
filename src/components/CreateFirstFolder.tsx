import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { type Bookmark, type Folder } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, type SetStateAction } from "react";
import {
  bookmarksAtom,
  currentFolderAtom,
  foldersAtom,
  isNewFolderModalOpenAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Separator } from "./Separator";

export const CreateFirstFolder = () => {
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

        localStorage.setItem("currentFolderId", data.id);

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
      if (!oldFolders) return [newFolder];
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
    <AnimatePresence>
      <div className="flex w-full flex-row items-center justify-center align-middle">
        <motion.form
          className="mt-6 flex w-72 flex-col gap-3 rounded-md border border-black/20 bg-white/50 p-6 align-middle font-semibold text-black no-underline backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white md:w-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={(e) => {
            setIsNewFolderModalOpen(false);
            void handleCreateFolder(e);
          }}
        >
          <div className="flex flex-row items-center justify-between px-1 align-middle">
            <motion.div className="flex items-center gap-2 align-middle">
              <div className="mb-0.5">📁</div>
              <span className="text-lg font-semibold text-black dark:text-white">
                Create your first folder
              </span>
            </motion.div>
          </div>
          <Separator />
          <div className="mt-4 flex flex-row items-center gap-2 align-middle">
            <div className="flex flex-col">
              <label className="ml-0.5 text-sm font-normal text-zinc-500">
                Icon
              </label>
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
                      sideOffset={35}
                      side="left"
                      align="end"
                      className="z-[10001] mt-2 h-[10rem] w-[300px] rounded-md font-semibold text-white no-underline outline-none focus:outline-none"
                    >
                      <Picker
                        theme={theme === "dark" ? "dark" : "light"}
                        onEmojiSelect={(emojiData: {
                          native: SetStateAction<string>;
                        }) => {
                          setIcon(emojiData.native);
                          setEmojiPickerOpen(false);
                        }}
                        navPosition="none"
                        skinTonePosition="none"
                        searchPosition="top"
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
              <label className="ml-0.5  text-sm font-normal text-zinc-500">
                Name*
              </label>
              <input
                type="text"
                className="mt-1 w-36 rounded-md bg-black/10 px-3 py-2 text-sm font-normal text-black placeholder-zinc-600 dark:bg-white/10 dark:text-white md:w-full"
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
            disabled={isCreatingFolder || name.length === 0}
            className={`${
              name.length > 0
                ? "bg-black/10 text-black dark:bg-white/10 dark:text-white"
                : "bg-black/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-600"
            } mt-4 rounded-md px-4 py-2 text-center align-middle font-semibold no-underline transition duration-200 hover:cursor-pointer`}
          >
            <p>Create</p>
          </motion.button>
        </motion.form>
      </div>
    </AnimatePresence>
  );
};
