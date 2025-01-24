import { type Folder } from "@prisma/client";
import { atom } from "jotai";

type SmallBookmark = {
  id: string;
  url: string;
  title: string;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
};

type FolderWithCount = Folder & {
  _count?: {
    bookmarks: number;
  };
};

export const isOpenAtom = atom(false);
export const showMonthsAtom = atom(true);
export const isNewFolderModalOpenAtom = atom<boolean>(false);
export const isDeleteFolderModalOpenAtom = atom<boolean>(false);
export const viewStyleAtom = atom<"expanded" | "compact">("compact");
export const currentPageAtom = atom(1);
export const currentFolderAtom = atom<Folder | null>(null);
export const foldersAtom = atom<FolderWithCount[] | null>(null);
export const bookmarksAtom = atom<SmallBookmark[] | null>(null);
export const bookmarksFilteredAtom = atom<SmallBookmark[] | null>(null);
export const totalBookmarksAtom = atom<number | null>(null);