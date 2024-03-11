import * as Checkbox from "@radix-ui/react-checkbox";
import {
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  ExitIcon,
  GearIcon,
  HamburgerMenuIcon,
  LayoutIcon,
  LightningBoltIcon,
  MoonIcon,
  RowsIcon,
  SunIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  currentFolderAtom,
  isOpenAtom,
  showMonthsAtom,
  viewStyleAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Hotkey } from "./Hotkey";
import { Separator } from "./Separator";
import { Spinner } from "./Spinner";

export const ProfileMenu = () => {
  const session = useSession();
  const [signinOut, setSigninOut] = useState(false);
  const [, setIsOpen] = useAtom(isOpenAtom);
  const { resolvedTheme, setTheme } = useTheme();
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom);
  const [showMonths, setShowMonths] = useAtom(showMonthsAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);

  useHotkeys(
    "t",
    () => {
      handleChangeTheme(resolvedTheme === "light" ? "dark" : "light");
    },
    {
      enableOnFormTags: false,
    }
  );

  useHotkeys(
    "d",
    () => {
      handleUpdateFolder();
    },
    {
      enableOnFormTags: false,
    }
  );

  useHotkeys(
    "m",
    () => {
      handleUpdateShowMonths();
    },
    {
      enableOnFormTags: false,
    }
  );

  useHotkeys(
    "v",
    () => {
      handleChangeViewStyle(viewStyle === "compact" ? "expanded" : "compact");
    },
    {
      enableOnFormTags: false,
    }
  );

  const updateFolder = api.folders.update.useMutation();

  const handleChangeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const handleSignOut = () => {
    setSigninOut(true);
    signOut().catch((err) => console.error(err));
  };

  const handleUpdateFolder = () => {
    const updatedDuplicate = !currentFolder?.allowDuplicate;

    const updatedFolder = {
      id: String(currentFolder?.id),
      isShared: Boolean(currentFolder?.isShared),
      allowDuplicate: updatedDuplicate,
      name: String(currentFolder?.name),
      icon: String(currentFolder?.icon),
      createdAt: currentFolder?.createdAt ?? new Date(),
      updatedAt: currentFolder?.updatedAt ?? new Date(),
      userId: String(currentFolder?.userId),
    };

    setCurrentFolder(updatedFolder);

    updateFolder.mutate({
      id: String(currentFolder?.id),
      allowDuplicate: updatedDuplicate,
      icon: null,
      isShared: null,
      name: null,
    });
  };

  const handleChangeViewStyle = (newViewStyle: "compact" | "expanded") => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setViewStyle(newViewStyle);
  };

  const handleUpdateShowMonths = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setShowMonths(!showMonths);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <motion.button
          whileTap={{
            scale: 0.95,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-full bg-black/10 p-2 text-black no-underline transition hover:bg-black/20 dark:bg-white/10 dark:text-white dark:dark:hover:bg-white/20"
        >
          <div className="flex items-center gap-x-2 align-middle">
            {session.data?.user?.image ? (
              <Image
                src={session.data?.user?.image}
                width={24}
                height={24}
                className="rounded-full"
                alt="Profile Picture"
              />
            ) : (
              <div className="h-6 w-6 rounded-full  bg-black/20 dark:bg-white/20" />
            )}
          </div>
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 mr-6 md:mr-12">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:w-80 w-64 flex flex-col gap-3 rounded-md border border-black/10 bg-black/5 p-4 align-middle font-semibold text-black no-underline backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <div className="flex items-center gap-2 px-1 align-middle">
              <div className="flex items-center gap-2 align-middle">
                <GearIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                <p>Settings</p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4 px-1">
              <div className="flex items-center justify-between gap-x-2 pt-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {viewStyle === "compact" ? (
                      <motion.div
                        key="compact"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <HamburgerMenuIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <RowsIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">View</p>
                  <Hotkey key1="v" />
                </div>
                <ToggleGroup.Root
                  type="single"
                  defaultValue={viewStyle}
                  className="flex items-center gap-x-2 align-middle"
                  onValueChange={(value) => {
                    if (value !== viewStyle && value !== "") {
                      handleChangeViewStyle(value as "compact" | "expanded");
                    }
                  }}
                >
                  <ToggleGroup.Item
                    value="compact"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-200 ease-in-out hover:text-black dark:hover:text-white ${
                        viewStyle === "compact"
                          ? "font-semibold"
                          : "font-normal text-zinc-500"
                      }`}
                    >
                      Compact
                    </p>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value="expanded"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-200 ease-in-out hover:text-black dark:hover:text-white ${
                        viewStyle === "expanded"
                          ? "font-semibold"
                          : "font-normal text-zinc-500"
                      }`}
                    >
                      Expanded
                    </p>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div>

              <div className="flex flex-row justify-between align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {resolvedTheme === "light" ? (
                      <motion.div
                        key="light"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <SunIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dark"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <MoonIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Day or night</p>
                  <Hotkey key1="t" />
                </div>
                <ToggleGroup.Root
                  type="single"
                  defaultValue={resolvedTheme}
                  className="flex items-center gap-x-2 align-middle"
                  onValueChange={(value) => {
                    if (value !== resolvedTheme && value !== "") {
                      handleChangeTheme(value as "light" | "dark");
                    }
                  }}
                >
                  <ToggleGroup.Item
                    value="light"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-200 ease-in-out hover:text-black dark:hover:text-white ${
                        resolvedTheme === "light"
                          ? "font-semibold"
                          : "font-normal text-zinc-500"
                      }`}
                    >
                      Day
                    </p>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value="dark"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-200 ease-in-out hover:text-black dark:hover:text-white ${
                        resolvedTheme === "dark"
                          ? "font-semibold"
                          : "font-normal text-zinc-500"
                      }`}
                    >
                      Night
                    </p>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div>

              <div className="flex items-center justify-between gap-x-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {showMonths ? (
                      <motion.div
                        key="showMonths"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <CalendarIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="notShowMonths"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <LayoutIcon className="h-4 w-4 rotate-90 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Show months?</p>
                  <Hotkey key1="m" />
                </div>
                <Checkbox.Root
                  defaultChecked={showMonths}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-black/10 transition  duration-200 ease-in-out hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 "
                  onCheckedChange={() => {
                    handleUpdateShowMonths();
                  }}
                >
                  <motion.div
                    whileTap={{
                      scale: 0.8,
                    }}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4" />
                    </Checkbox.Indicator>
                  </motion.div>
                </Checkbox.Root>
              </div>

              <div className="flex items-center justify-between gap-x-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {currentFolder?.allowDuplicate ? (
                      <motion.div
                        key="allowDuplicate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <CopyIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="notAllowDuplicate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ViewHorizontalIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Allow duplicates?</p>
                  <Hotkey key1="d" />
                </div>
                <Checkbox.Root
                  defaultChecked={currentFolder?.allowDuplicate}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-black/10 transition  duration-200 ease-in-out hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 "
                  onCheckedChange={() => {
                    handleUpdateFolder();
                  }}
                >
                  <motion.div
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4" />
                    </Checkbox.Indicator>
                  </motion.div>
                </Checkbox.Root>
              </div>

              <div className="flex items-center justify-between gap-x-2 pb-1 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <ExitIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                  <p className="text-sm font-normal">Sign out</p>
                </div>
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  disabled={signinOut}
                  onClick={handleSignOut}
                  className={`flex h-6 w-6 items-center justify-center rounded-md bg-black/10 font-semibold text-black no-underline transition ease-in-out hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20  `}
                >
                  {signinOut ? (
                    <Spinner size="sm" />
                  ) : (
                    <p className="text-xs font-normal ">{"->"}</p>
                  )}
                </motion.button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-x-3 px-1 align-middle">
              <LightningBoltIcon className="h-4 w-4 text-zinc-500 " />

              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold">Pro tip </p>
                <div className="flex items-center gap-1.5 align-middle">
                  <span className="text-sm font-normal text-zinc-500 ">
                    Press
                  </span>
                  <Hotkey key1="f" />
                  <p className="text-sm font-normal text-zinc-500">
                    to open Folders
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
