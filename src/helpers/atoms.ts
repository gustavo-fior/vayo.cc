import { type Folder } from "@prisma/client";
import { atom } from "jotai";

export const isOpenAtom = atom(false);
export const showMonthsAtom = atom(true);
export const viewStyleAtom = atom<"expanded" | "compact">("expanded");
export const currentFolderAtom = atom<
  | (Folder & {
      bookmarks: {
        createdAt: Date;
        id: string;
        title: string;
        url: string;
        faviconUrl: string | null;
        ogImageUrl: string | null;
      }[];
    })
  | null
>(null);
