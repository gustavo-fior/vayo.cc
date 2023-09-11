import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Spinner } from "./Spinner";

export const SignOutButton = () => {
  const [signinOut, setSigninOut] = useState(false);

  const handleSignOut = () => {
    setSigninOut(true);
    signOut().catch((err) => console.error(err));
  };
  return (
    <motion.button
      whileTap={{
        scale: 0.8,
      }}
      className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
      onClick={() => handleSignOut()}
    >
      {signinOut ? (
        <Spinner size="md" />
      ) : (
        <p>Sign out</p>
      )}
    </motion.button>
  );
};
