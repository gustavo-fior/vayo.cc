export const CompactSkeleton = () => {
  return (
    <a className="flex items-center gap-4 p-2">
          <div
            className="animate-pulse rounded-sm bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"
            style={{
              height: "1.4rem",
              width: "1.4rem",
            }}
          />
          <div className="h-4 md:w-56 w-72 animate-pulse rounded-md bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"></div>

          <div className="h-4 w-96 animate-pulse rounded-md md:block hidden bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#2d2c2c] from-[#bdbdbd] to-[#ececec]"></div>
    </a>
  );
};
