export const ExpandedSkeleton = () => {
  return (
    <a className="flex items-center gap-6 p-2">
      <div
        className="animate-pulse rounded-md hidden md:block bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"
        style={{
          height: "4rem",
          width: "12rem",
        }}
      />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-72 animate-pulse rounded-md bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"></div>
        <div className="flex items-center gap-2 align-middle">
          <div
            className="animate-pulse rounded-sm bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"
            style={{
              height: "0.9rem",
              width: "0.9rem",
            }}
          />

          <div className="h-3 md:w-96 w-48 animate-pulse rounded-md bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"></div>
        </div>
      </div>
    </a>
  );
};
