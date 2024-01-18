import Image from "next/image";
import { motion } from "framer-motion";

export const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 3 }}
    >
      <Image
        src="/images/hay.png"
        className={`mx-auto pt-32 opacity-80`}
        alt="hay"
        width={180}
        height={180}
        priority
      />
      <p className={`pt-10 text-center italic text-zinc-500`}>
        Not much going on down here...
      </p>
    </motion.div>
  );
};
