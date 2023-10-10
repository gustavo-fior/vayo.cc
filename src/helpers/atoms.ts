import { type Folder } from "@prisma/client";
import { atom } from "jotai";

export const directionAtom = atom<"asc" | "desc">("desc");
export const currentFolderAtom = atom<Folder | null>(null);
export const isOpenAtom = atom(false);
export const viewStyleAtom = atom<"expanded" | "compact">("expanded");