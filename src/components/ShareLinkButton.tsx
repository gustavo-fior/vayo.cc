import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { IoIosCheckmark, IoIosShareAlt } from "react-icons/io";

export const ShareLinkButton = ({ folderId }: { folderId?: string }) => {
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
            <IoIosCheckmark color="white" size={18} strokeWidth={32} />
          </motion.div>
        ) : (
          <motion.div
            key="notCopied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <IoIosShareAlt color="white" size={18} />
          </motion.div>
        )}
      </motion.button>
    </AnimatePresence>
  );
};
