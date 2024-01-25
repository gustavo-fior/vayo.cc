import { HamburgerMenuIcon, RowsIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

export const ViewButton = ({
  viewStyle,
  handleChangeViewStyle,
}: {
  viewStyle: string;
  handleChangeViewStyle: () => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileTap={{
        scale: 0.95,
      }}
      onClick={() => handleChangeViewStyle()}
      className="rounded-full bg-black/10 p-3 text-black no-underline transition hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
    >
      {viewStyle === "compact" ? (
        <motion.div
          key="compact"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <HamburgerMenuIcon className="h-4 w-4" />
        </motion.div>
      ) : (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <RowsIcon className="h-4 w-4" />
        </motion.div>
      )}
    </motion.button>
  );
};
