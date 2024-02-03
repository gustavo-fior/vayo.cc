import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useRef, useState, type ChangeEvent } from "react";
import { currentFolderAtom } from "~/helpers/atoms";
import { Spinner } from "./Spinner";

export function CreateOrSearchBookmarkForm({
  onSubmit,
  onChange,
  onCleanUp,
  isLoading,
  isDuplicate,
}: {
  onSubmit: ({ url }: { url: string }) => Promise<void>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCleanUp: () => void;
  isLoading: boolean;
  isDuplicate: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputUrl, setInputUrl] = useState("");
  const currentFolder = useAtom(currentFolderAtom)[0];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative mx-4 mt-8 md:mx-12"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={async (e) => {
        e.preventDefault();
        const url = inputUrl;
        onCleanUp();
        setInputUrl("");
        try {
          await onSubmit({ url });
        } catch (e) {
          console.error(e);
        }
      }}
    >
      <input
        type="url"
        name="url"
        id="url"
        ref={inputRef}
        value={isDuplicate ? "Duplicate" : inputUrl}
        disabled={!currentFolder}
        onChange={(e) => {
          setInputUrl(e.target.value);
          onChange(e);
        }}
        placeholder="https://... or ⌘F"
        className={`w-full rounded-lg bg-black/10 px-4 py-2 font-semibold  text-black no-underline placeholder-zinc-600 transition duration-200 ease-in-out placeholder:font-normal hover:bg-black/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10
    ${
      isDuplicate
        ? "animate-shake ring-2 ring-red-500 focus:outline-none focus:ring-red-500"
        : "outline-zinc-500 focus:outline-none focus:ring-zinc-500"
    }`}
      />
      {isLoading && (
        <motion.div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
          <Spinner size="md" />
        </motion.div>
      )}
    </motion.form>
  );
}
