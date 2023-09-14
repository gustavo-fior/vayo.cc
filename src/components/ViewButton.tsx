import { motion, AnimatePresence } from "framer-motion";
import { IoMdMenu } from "react-icons/io";
import { FiMenu } from "react-icons/fi";

export const ViewButton = ({
  viewStyle,
  handleChangeViewStyle,
}: {
  viewStyle: string;
  handleChangeViewStyle: () => void;
}) => {
  return (
    <motion.button
      whileTap={{
        scale: 0.8,
      }}
      onClick={() => handleChangeViewStyle()}
      className="rounded-full bg-white/10 p-3 no-underline transition hover:bg-white/20"
    >
      <AnimatePresence mode="popLayout">
        {viewStyle === "compact" ? (
          <motion.div
            key="compact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <IoMdMenu color="white" size={18} />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <FiMenu color="white" size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
