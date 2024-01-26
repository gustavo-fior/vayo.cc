export const Hotkey = ({
  key1,
  key2,
}: {
  key1: string;
  key2?: string;
}) => {
  return (
    <div className="hidden sm:block">
      <div className="flex flex-row items-center gap-1">
        <p className="rounded-sm bg-black/5 px-1.5 py-0.5 text-xs font-normal text-zinc-700 dark:bg-white/5 dark:text-gray-400">
          {key1}
        </p>
        {key2 && (
          <p className="rounded-sm bg-black/5 px-1.5 py-0.5 text-xs font-normal text-zinc-700 dark:bg-white/5 dark:text-gray-400">
            {key2}
          </p>
        )}
      </div>
    </div>
  );
};
