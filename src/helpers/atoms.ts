import { type Bookmark, type Folder } from "@prisma/client";
import { atom } from "jotai";

export const isOpenAtom = atom(false);
export const directionAtom = atom<"asc" | "desc">("desc");
export const showMonthsAtom = atom(true);
export const viewStyleAtom = atom<"expanded" | "compact">("expanded");
export const currentFolderAtom = atom<Folder & { bookmarks: Bookmark[] } | null>(null);