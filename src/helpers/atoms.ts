import { type Bookmark, type Folder } from "@prisma/client";
import { atom } from "jotai";

export const isOpenAtom = atom(false);
export const showMonthsAtom = atom(true);
export const viewStyleAtom = atom<"expanded" | "compact">("expanded");
export const currentFolderAtom = atom<Folder | null>(null);
export const foldersAtom = atom<Folder[] | null>(null);
export const bookmarksAtom = atom<Bookmark[] | null>(null);
export const totalBookmarksAtom = atom<number | null>(null);
