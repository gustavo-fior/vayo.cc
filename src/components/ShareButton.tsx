import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { api } from "~/utils/api";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

export const ShareButton = ({ folderId }: { folderId?: string }) => {
  const { data: folder } = api.folders.findById.useQuery({
    id: folderId ?? "",
  });
  const [isShared, setIsShared] = useState(false);
  const { mutate: updateFolder } = api.folders.update.useMutation({});
  
  const handleCopyToClipboard = async () => {
    const url = window.location.hostname + "/bookmarks/" + folderId;
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
          onClick={() => {
            void handleCopyToClipboard();
          }}
          className="rounded-md bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Share
        </motion.button>
      </Popover.Trigger>
      {folderId && (
        <Popover.Portal>
          <Popover.Content className="mt-2 rounded-md bg-white/10 px-4 py-2 font-semibold text-white no-underline transition">
            <div className="flex items-center gap-3 align-middle">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full ${
                    isShared ? "animate-ping bg-green-500" : "bg-gray-700"
                  }  rounded-full  opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isShared ? "bg-green-500" : "bg-gray-700"
                  }`}
                ></span>
              </span>
              <p>{isShared ? "This page is live!" : "This page is private!"}</p>
              <Switch.Root
                onClick={() => {
                  setIsShared(!isShared);
                  handleUpdateFolder();
                }}
                className="h-6 w-12 rounded-full bg-white/10"
              >
                <Switch.Thumb
                  className={`block h-4 w-4 bg-white transition-transform duration-100 will-change-transform ${
                    isShared ? "translate-x-7" : "translate-x-1"
                  }  rounded-full`}
                />
              </Switch.Root>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                onClick={() => {
                  void handleCopyToClipboard();
                }}
                className="rounded-md bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Share
              </motion.button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      )}
    </Popover.Root>
  );
};
