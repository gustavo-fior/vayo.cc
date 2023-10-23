import * as Checkbox from "@radix-ui/react-checkbox";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  ExitIcon,
  GearIcon,
  HamburgerMenuIcon,
  RowsIcon,
  ViewHorizontalIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  currentFolderAtom,
  directionAtom,
  isOpenAtom,
  viewStyleAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import { Separator } from "./Separator";
import { Spinner } from "./Spinner";
import { useTheme } from "next-themes";

export const ProfileMenu = () => {
  const session = useSession();
  const utils = api.useContext();
  const [signinOut, setSigninOut] = useState(false);
  const [direction, setDirection] = useAtom(directionAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const { theme, setTheme } = useTheme();
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [allowDuplicate, setAllowDuplicate] = useState(
    currentFolder?.allowDuplicate
  );

  const user = api.users.findByUserId.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const updateUser = api.users.update.useMutation({});

  const mutate = api.folders.update.useMutation({
    onSuccess: (data) => {
      setCurrentFolder(data);
      void utils.folders.findById.invalidate();
    },
  });

  const handleChangeDirection = (newDirection: "asc" | "desc") => {
    setDirection(newDirection);

    const currentBookmarks = utils.bookmarks.findByFolderId.getData();

    utils.bookmarks.findByFolderId.setData(
      { folderId: String(currentFolder?.id), direction: direction },
      currentBookmarks?.reverse()
    );

    updateUser.mutate({
      id: String(user.data?.id),
      lastDirection: newDirection,
      lastViewStyle: viewStyle,
    });
  };

  const handleChangeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const handleSignOut = () => {
    setSigninOut(true);
    signOut().catch((err) => console.error(err));
  };

  const handleUpdateFolder = () => {
    const updated = !currentFolder?.allowDuplicate;

    setAllowDuplicate(updated);

    mutate.mutate({
      id: String(currentFolder?.id),
      allowDuplicate: updated,
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

    updateUser.mutate({
      id: String(user.data?.id),
      lastDirection: direction,
      lastViewStyle: newViewStyle,
    });
  };

  useEffect(() => {
    setAllowDuplicate(currentFolder?.allowDuplicate);
  }, [currentFolder]);

  useEffect(() => {
    user.data?.lastDirection &&
      setDirection(user.data?.lastDirection as "asc" | "desc");
    user.data?.lastViewStyle &&
      setViewStyle(user.data?.lastViewStyle as "compact" | "expanded");
  }, [user.data, setDirection, setViewStyle]);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <motion.button
          whileTap={{
            scale: 0.8,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="rounded-full dark:bg-white/10 bg-black/10 p-2 dark:text-white text-black no-underline transition dark:dark:hover:bg-white/20 hover:bg-black/20"
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
              <div className="h-6 w-6 rounded-full  dark:bg-white/20 bg-black/20" />
            )}
          </div>
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 mr-64">
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="mt-4 flex flex-col gap-3 rounded-md dark:bg-white/10 bg-black/5 p-4 align-middle font-semibold dark:text-white text-black no-underline backdrop-blur-lg"
          >
            <div className="flex items-center gap-2 px-1 align-middle">
              <div className="flex items-center gap-2 align-middle">
                <GearIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                <p>Settings</p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4 px-1">
              <div className="flex items-center justify-between gap-x-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {allowDuplicate ? (
                      <motion.div
                        key="allowDuplicate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <CopyIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="notAllowDuplicate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ViewHorizontalIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Allow duplicates?</p>
                </div>
                <Checkbox.Root
                  defaultChecked={allowDuplicate}
                  className="flex h-6 w-6 items-center justify-center rounded-md dark:bg-white/10 bg-black/10  transition duration-300 ease-in-out dark:hover:bg-white/20 hover:bg-black/20 "
                  onCheckedChange={() => {
                    handleUpdateFolder();
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

              <div className="flex w-72 flex-row justify-between align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {theme === "light" ? (
                      <motion.div
                        key="light"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <SunIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dark"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <MoonIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Day or night</p>
                </div>
                <ToggleGroup.Root
                  type="single"
                  defaultValue={theme}
                  className="flex items-center gap-x-2 align-middle"
                  onValueChange={(value) => {
                    if (value !== theme && value !== "") {
                      handleChangeTheme(value as "light" | "dark");
                    }
                  }}
                >
                  <ToggleGroup.Item
                    value="light"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        theme === "light"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
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
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        theme === "dark"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
                      }`}
                    >
                      Night
                    </p>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div>

              <div className="flex w-72 flex-row justify-between align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {direction === "asc" ? (
                      <motion.div
                        key="asc"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ArrowUpIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="desc"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ArrowDownIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Sort by</p>
                </div>
                <ToggleGroup.Root
                  type="single"
                  defaultValue={direction}
                  className="flex items-center gap-x-2 align-middle"
                  onValueChange={(value) => {
                    if (value !== direction && value !== "") {
                      handleChangeDirection(value as "asc" | "desc");
                    }
                  }}
                >
                  <ToggleGroup.Item
                    value="asc"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        direction === "asc"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
                      }`}
                    >
                      Oldest
                    </p>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value="desc"
                    className="flex items-center gap-x-2 align-middle"
                  >
                    <p
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        direction === "desc"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
                      }`}
                    >
                      Newest
                    </p>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div>

              <div className="flex items-center justify-between gap-x-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <AnimatePresence mode="popLayout">
                    {viewStyle === "compact" ? (
                      <motion.div
                        key="compact"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <HamburgerMenuIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <RowsIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">View style</p>
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
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        viewStyle === "compact"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
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
                      className={`text-sm transition duration-300 ease-in-out dark:hover:text-white hover:text-black ${
                        viewStyle === "expanded"
                          ? "font-semibold"
                          : "font-normal text-gray-400"
                      }`}
                    >
                      Expanded
                    </p>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div>

              <div className="flex items-center justify-between gap-x-2 align-middle">
                <div className="flex items-center gap-x-3 align-middle">
                  <ExitIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                  <p className="text-sm font-normal">Sign out</p>
                </div>
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  disabled={signinOut}
                  onClick={handleSignOut}
                  className={`flex h-6 w-8 items-center justify-center rounded-md dark:bg-white/10 bg-black/10 font-semibold dark:text-white text-black no-underline transition ease-in-out dark:hover:bg-white/20 hover:bg-black/20  `}
                >
                  {signinOut ? (
                    <Spinner size="sm" />
                  ) : (
                    <p className="text-sm font-normal ">{"->"}</p>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
