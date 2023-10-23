import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

export const DirectionButton = ({
  direction,
  handleChangeDirection,
}: {
  direction: string;
  handleChangeDirection: () => void;
}) => {

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{
        scale: 0.8,
      }}
      onClick={() => void handleChangeDirection()}
      className="rounded-full dark:bg-white/10 bg-black/10 p-3 dark:text-white text-black no-underline transition dark:hover:bg-white/20 hover:bg-black/20"
    >
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
    </motion.button>
  );
};