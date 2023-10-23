import { type Folder } from "@prisma/client";
import { ArchiveIcon, Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import EmojiPicker, {
  EmojiStyle,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { Spinner } from "./Spinner";
import { Separator } from "./Separator";

export const CreateFolderButton = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [popverOpen, setPopverOpen] = useState(false);
  const session = useSession();
  const utils = api.useContext();

  const { mutate: createFolder, isLoading: isCreatingFolder } =
    api.folders.create.useMutation({
      onSuccess: async () => {
        await utils.folders.findByUserId.invalidate({
          userId: String(session?.data?.user?.id),
        });
      },
      onError: () => {
        utils.folders.findByUserId.setData(
          { userId: String(session?.data?.user?.id) },
          (oldQueryData: Folder[] | undefined) => {
            return oldQueryData?.filter((folder) => folder.id !== "temp");
          }
        );
      },
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await utils.folders.findByUserId.cancel();

    const previousFolders = utils.folders.findByUserId.getData();

    utils.folders.findByUserId.setData(
      { userId: String(session?.data?.user?.id) },
      (oldQueryData: Folder[] | undefined) => {
        const newFolder: Folder = {
          id: "temp",
          name,
          icon,
          isShared: false,
          userId: String(session?.data?.user?.id),
          createdAt: new Date(),
          updatedAt: new Date(),
          allowDuplicate: true,
        };

        return oldQueryData ? [...oldQueryData, newFolder] : [newFolder];
      }
    );

    createFolder({
      name,
      icon,
      userId: null,
    });

    setName("");
    setIcon("");

    return { previousFolders };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Popover.Root
        open={popverOpen}
        onOpenChange={(open) => {
          setPopverOpen(open);

          if (!open) {
            setName("");
            setIcon("");
          }
        }}
      >
        <Popover.Trigger asChild>
          <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{
              scale: 0.8,
            }}
            type="submit"
            disabled={isCreatingFolder}
            className="rounded-full dark:bg-white/10 bg-black/10 p-3 align-middle font-semibold dark:text-white text-black no-underline transition hover:cursor-pointer dark:hover:bg-white/20 hover:bg-black/20"
            onClick={() => {
              setPopverOpen(true);
            }}
          >
            {isCreatingFolder ? (
              <Spinner size="sm" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
          </motion.button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-40 md:mr-60 mr-12">
            <motion.form
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="mt-4 flex w-72 flex-col gap-3 rounded-md dark:bg-white/10 bg-black/5 p-4 align-middle font-semibold dark:text-white text-black no-underline backdrop-blur-lg"
              onSubmit={(e) => {
                setPopverOpen(false);
                void handleSubmit(e);
              }}
            >
              <div className="flex items-center justify-between gap-2 align-middle">
                <div className="flex items-center gap-2 align-middle px-1">
                  <ArchiveIcon className="h-4 w-4 dark:text-gray-400 text-gray-800" />
                  <p>New folder</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-row items-center gap-2 align-middle px-1">
                <div className="flex flex-col">
                  <label className="text-sm font-normal text-gray-500">
                    Icon
                  </label>
                  <div className="mt-1 flex flex-row items-center gap-2 align-middle  ">
                    <Popover.Root
                      onOpenChange={(open) => {
                        setEmojiPickerOpen(open);
                      }}
                      open={emojiPickerOpen}
                    >
                      <Popover.Trigger asChild>
                        <motion.input
                          type="text"
                          whileTap={{
                            scale: 0.9,
                          }}
                          value={icon}
                          className="w-10 rounded-md dark:bg-white/10 bg-black/10 py-1.5 text-center text-white placeholder-zinc-600 placeholder-opacity-50"
                          placeholder="?"
                          readOnly
                        />
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className="z-50 mt-2 rounded-md font-semibold text-white no-underline transition">
                          <EmojiPicker
                            emojiStyle={EmojiStyle.APPLE}
                            previewConfig={{
                              showPreview: false,
                            }}
                            suggestedEmojisMode={SuggestionMode.RECENT}
                            theme={Theme.DARK}
                            skinTonePickerLocation={
                              SkinTonePickerLocation.PREVIEW
                            }
                            onEmojiClick={(emojiData) => {
                              setIcon(emojiData.emoji);
                              setEmojiPickerOpen(false);
                            }}
                            lazyLoadEmojis
                            autoFocusSearch
                            width={400}
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{
                        scale: 0.8,
                      }}
                      type="button"
                      disabled={isCreatingFolder || icon.length === 0}
                      className={`flex h-6 w-6 items-center justify-center rounded-md ${
                        icon.length === 0 ? "dark:bg-white/5 bg-black/5" : "dark:bg-white/10 bg-black/10"
                      } p-1.5 align-middle font-semibold text-white no-underline transition hover:bg-white/20`}
                      onClick={() => setIcon("")}
                    >
                      <Cross1Icon
                        className={`h-3 w-3 ${
                          icon.length === 0 ? "dark:text-white/20 text-black/20" : "dark:text-white text-black"
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-col pl-2">
                  <label className=" text-sm font-normal text-gray-500">
                    Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-40 rounded-md dark:bg-white/10 bg-black/10 px-3 py-2 font-normal text-sm dark:text-white text-black placeholder-zinc-600"
                    placeholder="Awesome refs"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <motion.button
                whileTap={{
                  scale: 0.8,
                }}
                type="submit"
                disabled={isCreatingFolder}
                className={`${
                  name.length > 0
                    ? "dark:bg-white/10 bg-black/10 dark:text-white text-black"
                    : "dark:bg-white/5 bg-black/5 dark:text-zinc-600 text-zinc-400"
                } items mt-2 rounded-md px-4 py-2 text-center align-middle font-semibold dark:text-white text-black no-underline transition hover:cursor-pointer dark:hover:bg-white/20 hover:bg-black/20`}
              >
                <p>Create</p>
              </motion.button>
            </motion.form>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </motion.div>
  );
};
