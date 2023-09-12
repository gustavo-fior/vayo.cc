import { type Folder } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Spinner } from "./Spinner";
import { IoMdTrash } from "react-icons/io";

export const DeleteFolderButton = ({ folderId }: { folderId: string }) => {
  const session = useSession();
  const utils = api.useContext();
  const { mutate: deleteFolder, isLoading: isDeletingFolder } =
    api.folders.delete.useMutation({});

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
        <IoMdTrash className="text-white" />
      )}
    </motion.button>
  );
};
