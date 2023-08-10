import { type Bookmark } from "@prisma/client";
import Image from "next/image";
import { api } from "~/utils/api";

const BookmarkList = ({ bookmarks }: { bookmarks: Bookmark[] }) => {
  const utils = api.useContext();

  const remove = api.bookmarks.delete.useMutation({
    async onSuccess() {
      await utils.bookmarks.invalidate();
    },
  });

  const handleDeleteBookmark = (id: string) => {
    remove.mutate({
      id,
    });
  };

  return bookmarks?.map((bookmark) => (
    <div key={bookmark.id} className="flex gap-4 ">
      <a className="group flex items-center gap-4" href={bookmark.url}>
        <Image
          src={String(bookmark.favicon)}
          alt={bookmark.title}
          width={16}
          height={16}
        />
        <p className="text-white">{bookmark.title}</p>
        <p className="text-gray-500">
          <span className="group-hover:underline">{bookmark.url}</span>
        </p>
      </a>
      <button
        className="z-10 font-bold text-red-500"
        onClick={() => handleDeleteBookmark(bookmark.id)}
      >
        x
      </button>
    </div>
  ));
};

export default BookmarkList;
