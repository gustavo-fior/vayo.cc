import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const ShareLinkButton = ({ folderId }: { folderId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    const url = window.location.hostname + "/bookmarks/" + folderId;
    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <AnimatePresence mode="popLayout">
      <motion.button
        whileTap={{
          scale: 0.8,
        }}
        onClick={() => {
          void handleCopyToClipboard();
        }}
        className="rounded-full bg-white/10 p-3 font-semibold text-white no-underline transition hover:bg-white/20"
      >
        {copied ? (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CheckIcon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="notCopied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CopyIcon className="h-4 w-4" />
          </motion.div>
        )}
      </motion.button>
    </AnimatePresence>
  );
};
