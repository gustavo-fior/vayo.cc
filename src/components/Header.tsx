import { PlusIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { ProfileMenu } from "./ProfileMenu";
import { ShareButton } from "./ShareButton";

import {
  currentFolderAtom,
  foldersAtom,
  isOpenAtom,
  bookmarksAtom,
  currentPageAtom,
} from "~/helpers/atoms";
import { useAtom } from "jotai";
import { Separator } from "./Separator";
import { CreateFolderButton } from "./CreateFolderButton";
import { DeleteFolderButton } from "./DeleteFolderButton";
import { Hotkey } from "./Hotkey";

export const Header = ({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
}) => {
  const [folders] = useAtom(foldersAtom);
  const [, setIsOpen] = useAtom(isOpenAtom);
  const [, setBookmarks] = useAtom(bookmarksAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);

  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the pressed key is a number and focus is not on an input element
      if (
        !isNaN(parseInt(event.key, 10)) &&
        event.key !== " " &&
        document.activeElement !== inputRef.current &&
        folders
      ) {
        const pressedNumber = parseInt(event.key, 10);
        if (pressedNumber > 0 && pressedNumber <= folders.length) {
          const folder = folders[pressedNumber - 1];
          setIsOpen(false);
          setBookmarks(null);
          setCurrentPage(1);
          setSelectOpen(false);
          setCurrentFolder(folder ?? null);
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    folders,
    setIsOpen,
    setBookmarks,
    setCurrentPage,
    setCurrentFolder,
    inputRef,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full flex-row items-center justify-between px-12"
    >
      <Select.Root
        open={selectOpen}
        onOpenChange={setSelectOpen}
        onValueChange={(value) => {
          const folder = folders?.find((folder) => folder.id === value);

          setIsOpen(false);
          setBookmarks(null);
          setCurrentPage(1);
          setSelectOpen(false);
          setCurrentFolder(folder ?? null);
        }}
      >
        <Select.Trigger className="text-md inline-flex cursor-pointer items-center justify-between rounded-md focus:outline-none">
          <Select.Value className="flex items-center">
            {currentFolder?.icon}
            <span className="ml-2">{currentFolder?.name}</span>
          </Select.Value>
          <Select.Icon className="ml-4">
            <ChevronDownIcon
              className={`h-4 w-4 transform text-zinc-500 transition-transform duration-200 ${
                selectOpen ? "rotate-180" : ""
              }`}
            />
          </Select.Icon>
          <div className="flex justify-between px-0 align-middle md:px-2">
            <div className="flex gap-2">
              {folders && folders.length > 0 && <DeleteFolderButton />}
              <CreateFolderButton />
            </div>
          </div>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content position="popper" sideOffset={10}>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-black/5 p-1 align-middle text-black no-underline backdrop-blur-lg dark:bg-white/10 dark:text-white"
            >
              <Select.Viewport className="flex flex-col">
                {folders?.map((folder, index) => (
                  <Select.Item
                    key={folder.id}
                    value={folder.id}
                    className={`cursor-pointer p-3 align-middle transition first:rounded-t-md last:rounded-b-md hover:bg-black/20 dark:hover:bg-white/20 ${
                      folder.id === currentFolder?.id
                        ? "bg-black/20 dark:bg-white/20"
                        : ""
                    }`}
                  >
                    <Select.ItemText>
                      <div className="flex items-center justify-between gap-4">
                        <p>
                          {folder.icon}{" "}
                          <span className="ml-1">{folder.name}</span>{" "}
                        </p>
                        <Hotkey key1={String(index + 1)} />
                      </div>
                    </Select.ItemText>
                  </Select.Item>
                ))}
                <Separator />
                <Select.Item
                  className="cursor-pointer p-3 align-middle transition first:rounded-t-md last:rounded-b-md hover:bg-black/20 dark:hover:bg-white/20"
                  value="new"
                >
                  <Select.ItemText>
                    <div className="flex items-center">
                      <PlusIcon className="h-4 w-4" />
                      <span className="ml-2">New Folder</span>
                    </div>
                  </Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </motion.div>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <div className="flex flex-row items-center justify-between gap-2">
        <ShareButton />
        <ProfileMenu />
      </div>
    </motion.div>
  );
};
