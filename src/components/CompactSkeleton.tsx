export const CompactSkeleton = () => {
  return (
    <a className="flex items-center gap-4 p-2">
          <div
            className="animate-pulse rounded-sm bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c]"
            style={{
              height: "0.9rem",
              width: "0.9rem",
            }}
          />
          <div className="h-3 w-56 animate-pulse rounded-md bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c]"></div>

          <div className="h-3 w-96 animate-pulse rounded-md bg-gradient-to-br from-[#1a1a1a] to-[#2d2c2c]"></div>
    </a>
  );
};
