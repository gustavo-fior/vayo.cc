import { type Folder } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Spinner } from "./Spinner";

export const DeleteFolderButton = ({
  folderId,
  setCurrentFolderId,
}: {
  folderId: string;
  setCurrentFolderId: (folderId: string) => void;
}) => {
  const session = useSession();
  const utils = api.useContext();
  const { mutate: deleteFolder, isLoading: isDeletingFolder } =
    api.folders.delete.useMutation({
      onSuccess: async () => {
        await utils.bookmarks.findByFolderId.invalidate({ folderId });
        await utils.folders.findByUserId.invalidate({ userId: session?.data?.user?.id });
        if (utils.folders.findByUserId.getData()?.length === 0) {
          setCurrentFolderId("");
        } else {
          setCurrentFolderId(utils.folders.findByUserId.getData()?.[0]?.id ?? "");
        }
      },
      onError: () => {
        utils.folders.findByUserId.setData(
          { userId: String(session?.data?.user?.id) },
          (oldQueryData: Folder[] | undefined) => {
            return oldQueryData?.filter((folder) => folder.id !== folderId);
          }
        );
      }
    });

  const handleDelete = async () => {
    await utils.folders.findByUserId.cancel();

    const previousFolders = utils.folders.findByUserId.getData();

    utils.folders.findByUserId.setData(
      { userId: String(session?.data?.user?.id) },
      (previousFolders: Folder[] | undefined) =>
        [
          ...(previousFolders?.filter((folder) => folder.id !== folderId) ??
            []),
        ] as Folder[]
    );

    deleteFolder({
      id: folderId,
    });

    return { previousFolders };
  };

  return (
    <motion.button
      whileTap={{
        scale: 0.8,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      type="submit"
      disabled={isDeletingFolder}
      className="rounded-full bg-white/10 p-3 align-middle font-semibold text-white no-underline transition hover:cursor-pointer hover:bg-white/20"
      onClick={() => {
        void handleDelete();
      }}
    >
      {isDeletingFolder ? (
        <Spinner size="sm" />
      ) : (
        <TrashIcon className="h-4 w-4" />
      )}
    </motion.button>
  );
};
