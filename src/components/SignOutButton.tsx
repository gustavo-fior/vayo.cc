import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Spinner } from "./Spinner";
import * as Popover from "@radix-ui/react-popover";
import Image from "next/image";
import { useAtom } from "jotai";
import {
  currentFolderIdAtom,
  directionAtom,
  isOpenAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExitIcon,
  HandIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Select from "@radix-ui/react-select";
import { Separator } from "./Separator";

export const SignOutButton = () => {
  const [signinOut, setSigninOut] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [direction, setDirection] = useAtom(directionAtom);
  const [currentFolderId] = useAtom(currentFolderIdAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const session = useSession();
  const utils = api.useContext();
  const mutate = api.folders.update.useMutation();

  const handleChangeDirection = () => {
    // handle direction change with a delay to allow the bookmarks list to close
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
    }, 10);

    setDirection(direction === "asc" ? "desc" : "asc");

    void utils.bookmarks.findByFolderId.invalidate();
  };

  const handleSignOut = () => {
    setSigninOut(true);
    signOut().catch((err) => console.error(err));
  };

  const handleUpdateFolder = () => {
    mutate.mutate({
      id: currentFolderId,
      allowDuplicate: allowDuplicate,
      icon: null,
      isShared: null,
      name: null,
    });
  };

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
            <Image
              src={
                session.data?.user?.image ?? "https://via.placeholder.com/150"
              }
              width={24}
              height={24}
              className="rounded-full"
              alt="Profile Picture"
            />
          </div>
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 mr-60">
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="mt-4 flex flex-col gap-2 rounded-md bg-white/10 p-4 align-middle font-semibold text-white no-underline backdrop-blur-lg"
          >
            <div className="flex w-64 flex-row justify-between align-middle">
              <div className="flex items-center gap-x-2 align-middle">
                <AnimatePresence mode="popLayout">
                  {direction === "asc" ? (
                    <motion.div
                      key="asc"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="desc"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-sm font-normal">Sort by</p>
              </div>
              <Select.Root
                value={direction}
                onValueChange={handleChangeDirection}
              >
                <Select.Trigger className="rounded-md bg-white/10 px-3 py-1 text-white no-underline transition hover:bg-white/20">
                  <Select.Value placeholder="Select a fruit…" />
                  <Select.Icon className="SelectIcon">
                    <ChevronDownIcon />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Content className="z-50 rounded-md bg-white/10 p-4 align-middle font-semibold text-white no-underline backdrop-blur-lg">
                  <Select.Item value="asc" className="text-white">
                    <p>Ascending</p>
                  </Select.Item>
                  <Select.Item value="desc" className="text-white">
                    <p>Descending</p>
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <Separator height={1} />
            <div className="flex items-center justify-between gap-x-2 align-middle">
              <div className="flex items-center gap-x-2 align-middle">
                <AnimatePresence mode="popLayout">
                  {allowDuplicate ? (
                    <motion.div
                      key="allowDuplicate"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <CopyIcon className="h-4 w-4 text-gray-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="notAllowDuplicate"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ViewHorizontalIcon className="h-4 w-4 text-gray-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-sm font-normal">Allow duplicates?</p>
              </div>
              <Checkbox.Root
                defaultChecked={false}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition duration-300 ease-in-out hover:bg-white/20"
                onCheckedChange={() => {
                  setAllowDuplicate(!allowDuplicate);
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

            <Separator height={1} />

            <div className="flex items-center justify-between gap-x-2 align-middle">
              <div className="flex items-center gap-x-2 align-middle">
                <ExitIcon className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-normal">Sign out</p>
              </div>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                disabled={signinOut}
                onClick={handleSignOut}
                className={`rounded-md bg-white/10 px-3  font-semibold text-white no-underline transition ease-in-out hover:bg-white/20 ${
                  signinOut ? "py-1.5 px-5" : "py-1"
                }`}
              >
                {signinOut ? (
                  <Spinner size="sm" />
                ) : (
                  <p className="text-sm font-semibold">Bye!</p>
                )}
              </motion.button>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
