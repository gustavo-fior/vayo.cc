import { type Variants } from "framer-motion";

export const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 24,  },
  },
  closed: { opacity: 0, y: 20 },
};
