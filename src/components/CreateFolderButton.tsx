import { type Folder } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
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

export const CreateFolderButton = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const session = useSession();
  const utils = api.useContext();
  const [dialogOpen, setDialogOpen] = useState(false);
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
      }
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
        };

        return oldQueryData ? [...oldQueryData, newFolder] : [newFolder];
      }
    );

    createFolder({
      name,
      icon,
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
      <Dialog.Root open={dialogOpen}>
        <motion.button
          whileTap={{
            scale: 0.8,
          }}
          type="submit"
          disabled={isCreatingFolder}
          className="rounded-full bg-white/10 p-3 align-middle font-semibold text-white no-underline transition hover:cursor-pointer hover:bg-white/20"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          {isCreatingFolder ? (
            <Spinner size="sm" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </motion.button>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{
              animation: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white/10 p-8 backdrop-blur-lg"
            style={{
              animation: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Dialog.Title className="text-xl font-semibold text-white">
              New folder
            </Dialog.Title>
            <form
              className="mt-4 flex flex-col"
              onSubmit={(e) => {
                setDialogOpen(false);
                void handleSubmit(e);
              }}
            >
              <div className="flex flex-row items-center gap-4 align-middle">
                <div className="flex flex-col">
                  <label className="text-gray-500">Icon</label>
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <input
                        type="text"
                        value={icon}
                        className="mt-1 w-12 rounded-md bg-white/10 py-2 text-center text-lg text-white placeholder-zinc-600 placeholder-opacity-50"
                        placeholder="📚"
                        readOnly
                      />
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content className="mt-2 rounded-md font-semibold text-white no-underline transition">
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
                          }}
                          lazyLoadEmojis
                          autoFocusSearch
                        />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
                <div className="flex flex-col">
                  <label className=" text-gray-500">Name</label>
                  <input
                    type="text"
                    className="mt-1 w-40 rounded-md bg-white/10 px-4 py-3 text-white placeholder-zinc-600"
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
                    ? "bg-white/10 text-white"
                    : "bg-white/5 text-zinc-600"
                } mt-8 rounded-md  px-4 py-2 text-center align-middle font-semibold text-white no-underline transition hover:cursor-pointer hover:bg-white/20`}
              >
                {isCreatingFolder ? <Spinner size="sm" /> : <p>Create</p>}
              </motion.button>
            </form>
            <motion.button
              onClick={() => {
                setDialogOpen(false);
              }}
              whileTap={{
                scale: 0.8,
              }}
              className="absolute right-10 top-10 text-slate-500 transition duration-300 ease-in-out hover:text-white"
            >
              <Cross1Icon className="h-4 w-4" />
            </motion.button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.div>
  );
};
