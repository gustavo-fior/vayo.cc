import { HamburgerMenuIcon, RowsIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";


export const ViewButton = ({
  viewStyle,
  handleChangeViewStyle,
}: {
  viewStyle: string;
  handleChangeViewStyle: () => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{
        scale: 0.8,
      }}
      onClick={() => handleChangeViewStyle()}
      className="rounded-full bg-white/10 p-3 no-underline text-white transition hover:bg-white/20"
    >
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </motion.button>
  );
};
