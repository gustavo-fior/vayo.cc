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

export const ProfileMenu = () => {
  const session = useSession();
  const utils = api.useContext();
  const [signinOut, setSigninOut] = useState(false);
  const [direction, setDirection] = useAtom(directionAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [allowDuplicate, setAllowDuplicate] = useState(
    currentFolder?.allowDuplicate
  );

  const mutate = api.folders.update.useMutation({
    onSuccess: (data) => {
      setCurrentFolder(data);
      void utils.folders.findById.invalidate();
    },
  });

  const handleChangeDirection = (newDirection: "asc" | "desc") => {
    setDirection(newDirection);

    void utils.bookmarks.findByFolderId.invalidate();
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
  };

  useEffect(() => {
    setAllowDuplicate(currentFolder?.allowDuplicate);
  }, [currentFolder]);

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
          className="rounded-full bg-white/10 p-2 text-white no-underline transition hover:bg-white/20"
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
              <div className="h-6 w-6 rounded-full bg-white/20" />
            )}
          </div>
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 mr-60">
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="mt-4 flex flex-col gap-3 rounded-md bg-white/10 p-4 align-middle font-semibold text-white no-underline backdrop-blur-lg"
          >
            <div className="flex items-center gap-2 align-middle">
              <div className="flex items-center gap-2 align-middle">
                <GearIcon className="h-4 w-4 text-gray-400" />
                <p>Settings</p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
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
                        <CopyIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="notAllowDuplicate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ViewHorizontalIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-normal">Allow duplicates?</p>
                </div>
                <Checkbox.Root
                  defaultChecked={allowDuplicate}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition duration-300 ease-in-out hover:bg-white/20"
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
                    {direction === "asc" ? (
                      <motion.div
                        key="asc"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ArrowUpIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="desc"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <ArrowDownIcon className="h-4 w-4 text-gray-400" />
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
                      className={`text-sm transition duration-300 ease-in-out hover:text-white ${
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
                      className={`text-sm transition duration-300 ease-in-out hover:text-white ${
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
                        <HamburgerMenuIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <RowsIcon className="h-4 w-4 text-gray-400" />
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
                      className={`text-sm transition duration-300 ease-in-out hover:text-white ${
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
                      className={`text-sm transition duration-300 ease-in-out hover:text-white ${
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
                  <ExitIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-normal">Sign out</p>
                </div>
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  disabled={signinOut}
                  onClick={handleSignOut}
                  className={`flex h-6 w-8 items-center justify-center rounded-md bg-white/10 font-semibold text-white no-underline transition ease-in-out hover:bg-white/20 `}
                >
                  {signinOut ? (
                    <Spinner size="sm" />
                  ) : (
                    <p className="text-sm font-normal">{"->"}</p>
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
