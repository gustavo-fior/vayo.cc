import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, CopyIcon, GlobeIcon, Share2Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";

export const ShareButton = ({ folderId }: { folderId?: string }) => {
  const { data: folder } = api.folders.findById.useQuery({
    id: folderId ?? "",
  });

  const [copied, setCopied] = useState(false);

  const [isShared, setIsShared] = useState(false);
  const { mutate: updateFolder } = api.folders.update.useMutation({});

  const handleCopyToClipboard = async () => {
    const url = window.location.hostname + "/bookmarks/public/" + folderId;
    await navigator.clipboard.writeText(url);
  };

  const handleUpdateFolder = () => {
    updateFolder({
      id: folderId ?? "",
      isShared: !isShared,
      icon: folder?.icon ?? null,
      name: folder?.name ?? null,
    });
  };

  useEffect(() => {
    setIsShared(folder?.isShared ?? false);
  }, [folder]);

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
          className="rounded-full bg-white/10 px-3 py-2 text-white no-underline transition hover:bg-white/20"
        >
          <div className="flex items-center gap-x-2 align-middle">
            <Share2Icon className="h-4 w-4" />
          </div>
        </motion.button>
      </Popover.Trigger>
      {folderId && (
        <Popover.Portal>
          <Popover.Content className="z-50">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="mt-4 flex flex-col gap-3 rounded-md bg-white/10 p-4 align-middle font-semibold text-white no-underline backdrop-blur-lg"
            >
              <div className="flex items-center justify-between gap-2 align-middle">
                <div className="flex items-center gap-2 align-middle">
                  <GlobeIcon className="h-4 w-4" />
                  <p>Share</p>
                </div>
                <span className="relative mr-2 mt-0.5 flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full ${
                      isShared ? "animate-ping bg-green-500" : "bg-gray-700"
                    }  rounded-full opacity-75 transition duration-300 ease-in-out`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full transition duration-300 ease-in-out ${
                      isShared ? "bg-green-500" : "bg-gray-700"
                    }`}
                  />
                </span>
              </div>
              <div className="h-[2px] w-full rounded-full bg-white/5" />

              <div className="flex items-center gap-2 align-middle">
                <p className="font-normal">Public?</p>
                <Checkbox.Root
                  defaultChecked={isShared}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition duration-300 ease-in-out hover:bg-white/20"
                  onCheckedChange={() => {
                    setIsShared(!isShared);
                    handleUpdateFolder();
                  }}
                >
                  <motion.div
                    whileTap={{
                      scale: 0.8,
                    }}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    </Checkbox.Indicator>
                  </motion.div>
                </Checkbox.Root>
              </div>
              <div className="flex items-center gap-2 align-middle">
                <input
                  className={`rounded-md bg-white/10 px-3 py-2 text-sm font-normal no-underline transition duration-300  ease-in-out ${
                    !isShared ? "text-zinc-600/50" : "text-white"
                  }`}
                  type="text"
                  value={window.location.hostname + "/bookmarks/public/" + folderId}
                  readOnly
                />
                <AnimatePresence mode="popLayout">
                  <motion.button
                    whileTap={{
                      scale: 0.8,
                    }}
                    disabled={!isShared}
                    onClick={() => {
                      setCopied(true);

                      setTimeout(() => {
                        setCopied(false);
                      }, 4000);

                      void handleCopyToClipboard();
                    }}
                    className="rounded-md bg-white/10 px-4 py-2.5 font-semibold text-white no-underline transition ease-in-out hover:bg-white/20"
                  >
                    {copied ? (
                      <motion.div
                        key={"copied"}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={"copy"}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                      >
                        <CopyIcon
                          className={`h-4 w-4 transition duration-300 ease-in-out ${
                            isShared ? "text-white" : "text-zinc-600/50"
                          }`}
                        />
                      </motion.div>
                    )}
                  </motion.button>
                </AnimatePresence>
              </div>
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      )}
    </Popover.Root>
  );
};
