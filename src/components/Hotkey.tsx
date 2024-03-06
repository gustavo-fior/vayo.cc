export const Hotkey = ({
  key1,
  key2,
  red,
}: {
  key1: string;
  key2?: string;
  red?: boolean;
}) => {
  return (
    <div className="hidden sm:block">
      <div className="flex flex-row items-center gap-1 text-xs font-medium">
        <p className={`rounded-sm ${red ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-700" : "bg-black/5 text-zinc-700 dark:bg-white/5 dark:text-gray-400"} px-1.5 py-0.5 `}>
          {key1}
        </p>
        {key2 && (
          <p className={`rounded-sm px-1.5 py-0.5 ${red ? "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-700" : "bg-black/5 text-zinc-700 dark:bg-white/5 dark:text-gray-400"}`}>
            {key2}
          </p>
        )}
      </div>
    </div>
  );
};
