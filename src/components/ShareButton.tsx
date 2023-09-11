import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";

export const ShareButton = ({ folderId }: { folderId: string }) => {
  const handleCopyToClipboard = () => {
    const url = window.location.hostname + "/bookmarks/" + folderId;
    navigator.clipboard.writeText(url).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <motion.button
          whileTap={{
            scale: 0.8,
          }}
          onClick={() => {
            handleCopyToClipboard();
          }}
          className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Share
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="mt-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition">
          <div className="flex items-center gap-2 align-middle">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p>This page is live!</p>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
