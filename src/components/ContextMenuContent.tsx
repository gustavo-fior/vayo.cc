import { type Bookmark } from "@prisma/client";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  DoubleArrowRightIcon,
  Link1Icon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import {
  bookmarksAtom,
  bookmarksFilteredAtom,
  currentFolderAtom,
  foldersAtom,
  totalBookmarksAtom,
} from "~/helpers/atoms";
import { api } from "~/utils/api";

export const ContextMenuContent = ({
  bookmark,
  setIsEditing,
  isPrivatePage,
}: {
  bookmark: Bookmark;
  setIsEditing: (value: boolean) => void;
  isPrivatePage: boolean;
}) => {
  const utils = api.useUtils();
  const [folders] = useAtom(foldersAtom);
  const [currentFolder] = useAtom(currentFolderAtom);
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
  const [, setTotalBookmarks] = useAtom(totalBookmarksAtom);
  const [filteredBookmarks, setFilteredBookmarks] = useAtom(
    bookmarksFilteredAtom
  );

  const otherFolders = folders?.filter(
    (folder) => folder.id !== currentFolder?.id
  );

  const moveBookmark = api.bookmarks.move.useMutation({
    onMutate: () => {
      if (filteredBookmarks && filteredBookmarks.length > 0) {
        setFilteredBookmarks(
          filteredBookmarks.filter((b) => b.id !== bookmark.id)
        );

        return;
      }

      setBookmarks(
        bookmarks?.filter((b) => b.id !== bookmark.id) as Bookmark[]
      );

      setTotalBookmarks((oldTotal) => (oldTotal ?? 0) - 1);
    },
    onError: (context) => {
      const previousBookmarks =
        (
          context as {
            previousBookmarks?: {
              bookmarks: Bookmark[];
              totalElements: number;
            };
          }
        )?.previousBookmarks ?? null;

      utils.bookmarks.findByFolderId.setData(
        { folderId: String(currentFolder?.id) },
        previousBookmarks!
      );
    },
  });

  return (
    <ContextMenu.Content className="z-50 rounded-lg border border-black/10 bg-black/5 p-1 align-middle  no-underline backdrop-blur-lg dark:border-white/10">
      <ContextMenu.Item
        className="rounded-md px-3 py-2 text-black outline-none transition duration-200 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20"
        onClick={() => {
          void navigator.clipboard.writeText(bookmark.url);
        }}
      >
        <div className="flex items-center gap-3 align-middle">
          <Link1Icon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
          <p>Copy link</p>
        </div>
      </ContextMenu.Item>
      {isPrivatePage && (
        <ContextMenu.Item
          className="rounded-md px-3 py-2 text-black outline-none transition duration-200 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          <div className="flex items-center gap-3 align-middle">
            <Pencil1Icon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
            <p>Rename</p>
          </div>
        </ContextMenu.Item>
      )}

      {otherFolders && otherFolders.length > 0 && isPrivatePage && (
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger className="flex items-center gap-3 rounded-md px-3 py-2 align-middle text-black outline-none transition duration-200 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white dark:hover:bg-white/20">
            <DoubleArrowRightIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
            <p>Move</p>
          </ContextMenu.SubTrigger>
          <ContextMenu.Portal>
            <ContextMenu.SubContent
              className="z-50 rounded-md border border-black/10 bg-black/5 p-1 align-middle  no-underline backdrop-blur-lg dark:border-white/10"
              sideOffset={2}
              alignOffset={-5}
            >
              {otherFolders.map((folder) => (
                <ContextMenu.Item
                  key={folder.id}
                  className="rounded-md px-3 py-2 text-black outline-none transition duration-300 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20"
                  onClick={() => {
                    moveBookmark.mutate({
                      id: bookmark.id,
                      folderId: folder.id,
                    });
                  }}
                >
                  <div className="flex items-center gap-2 align-middle">
                    <div className="mb-0.5">{folder?.icon}</div>
                    <span className="font-medium">{folder?.name}</span>
                  </div>
                </ContextMenu.Item>
              ))}
            </ContextMenu.SubContent>
          </ContextMenu.Portal>
        </ContextMenu.Sub>
      )}
    </ContextMenu.Content>
  );
};
