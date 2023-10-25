import Image from "next/image";
import { motion } from "framer-motion";

export const ListLongImage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 3 }}
      className="flex align-middle items-center gap-12 justify-end mr-12"
    >
      <p className="text-lg italic text-gray-500">Long list, huh?</p>
      <Image
        src="/images/sleeping_guy.png"
        className={`opacity-60`}
        alt="sleeping guy"
        width={180}
        height={180}
      />
    </motion.div>
  );
};
