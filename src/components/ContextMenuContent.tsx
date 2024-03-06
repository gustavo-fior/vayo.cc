import * as ContextMenu from "@radix-ui/react-context-menu";
import { DoubleArrowRightIcon, Link1Icon } from "@radix-ui/react-icons";
import { Separator } from "./Separator";
import { useAtom } from "jotai";
import { bookmarksAtom, bookmarksFilteredAtom, currentFolderAtom, foldersAtom } from "~/helpers/atoms";
import { api } from "~/utils/api";
import { type Bookmark } from "@prisma/client";

export const ContextMenuContent = ({ bookmark }: { bookmark: Bookmark }) => {
  const utils = api.useContext();
  const [folders] = useAtom(foldersAtom);
  const [currentFolder] = useAtom(currentFolderAtom);
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
  const [filteredBookmarks, setFilteredBookmarks] = useAtom(bookmarksFilteredAtom);

  const moveBookmark = api.bookmarks.move.useMutation({
    onMutate: () => {
      if (filteredBookmarks && filteredBookmarks.length > 0) {
        setFilteredBookmarks(
          filteredBookmarks.filter((b) => b.id !== bookmark.id)
        );

        return;
      }

      setBookmarks(bookmarks?.filter((b) => b.id !== bookmark.id) as Bookmark[]);
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
        className="rounded-lg px-3 py-2 text-black outline-none transition duration-300 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20"
        onClick={() => {
          void navigator.clipboard.writeText(bookmark.url);
        }}
      >
        <div className="flex items-center gap-2 align-middle">
          <Link1Icon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
          <p>Copy link</p>
        </div>
      </ContextMenu.Item>

      <div className="my-1">
        <Separator />
      </div>
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger className="rounded-lg px-3 py-2 text-black outline-none transition duration-300 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20">
          <div className="flex items-center gap-2 align-middle">
            <DoubleArrowRightIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
            <p>Move</p>
          </div>
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent
            className="z-50 rounded-lg border border-black/10 bg-black/5 p-1 align-middle  no-underline backdrop-blur-lg dark:border-white/10"
            sideOffset={2}
            alignOffset={-5}
          >
            {folders?.filter(
              (folder) => folder.id !== currentFolder?.id
            ).map((folder) => (
              <ContextMenu.Item
                key={folder.id}
                className="rounded-lg px-3 py-2 text-black outline-none transition duration-300 ease-in-out hover:cursor-pointer hover:bg-black/20 focus:outline-none dark:text-white  dark:hover:bg-white/20"
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
    </ContextMenu.Content>
  );
};
