import { motion } from "framer-motion";
import { Spinner } from "./Spinner";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import * as Dialog from "@radix-ui/react-dialog";
import EmojiPicker, {
  EmojiStyle,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { api } from "~/utils/api";
import { type Folder } from "@prisma/client";
import { useSession } from "next-auth/react";

export const CreateFolderButton = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const session = useSession();
  const utils = api.useContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: createFolder, isLoading: isCreatingFolder } =
    api.folders.create.useMutation({});

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
          <IoMdAdd color="white" size={16} strokeWidth={32} />
        )}
      </motion.button>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          style={{
            animation: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-zinc-800 p-8"
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
            <label className="text-gray-500">Icon</label>
            <Popover.Root>
              <Popover.Trigger asChild>
                <input
                  type="text"
                  value={icon}
                  className="mt-1 w-12 rounded-md bg-white/10 py-2 text-center text-lg text-white placeholder-zinc-600 placeholder-opacity-50"
                  placeholder="📚"
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
                    skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
                    onEmojiClick={(emojiData) => {
                      

                      setIcon(emojiData.emoji);
                    }}
                    lazyLoadEmojis
                    autoFocusSearch
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <label className="mt-4 text-gray-500">Name</label>
            <input
              type="text"
              className="mt-1 rounded-md bg-white/10 px-4 py-2 text-white placeholder-zinc-600"
              placeholder="Awesome refs"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <motion.button
              whileTap={{
                scale: 0.8,
              }}
              type="submit"
              disabled={isCreatingFolder}
              className=" mt-8 rounded-md bg-white/10 px-4 py-2 text-center align-middle font-semibold text-white no-underline transition hover:cursor-pointer hover:bg-white/20"
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
            className="absolute right-8 top-8"
          >
            <IoMdClose color="white" size={16} strokeWidth={32} />
          </motion.button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
