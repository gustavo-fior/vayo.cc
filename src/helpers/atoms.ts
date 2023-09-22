import { atom } from "jotai";

export const directionAtom = atom<"asc" | "desc">("asc");
export const isOpenAtom = atom(false);
export const currentFolderIdAtom = atom<string>("");
export const viewStyleAtom = atom<"expanded" | "compact">("expanded");