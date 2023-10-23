import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

export const ThemeButton = ({
  theme,
  handleChangeTheme,
}: {
  theme: string;
  handleChangeTheme: () => void;
}) => {

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{
        scale: 0.8,
      }}
      onClick={() => void handleChangeTheme()}
      className="rounded-full dark:bg-white/10 bg-black/10 p-3 dark:text-white text-black no-underline transition dark:hover:bg-white/20 hover:bg-black/20"
    >
      <AnimatePresence mode="popLayout">
        {theme === "light" ? (
          <motion.div
            key="light"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <SunIcon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="dark"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <MoonIcon className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};