export const Separator = ({
  height,
  mx,
  my,
}: {
  height?: number;
  mx?: number;
  my?: number;
}) => {
  return (
    <div
      className={`${height ? `h-[${height}px]` : "h-[2px]"} 
                          ${mx ? ` mx-${mx} ` : ""} 
                          ${my ? ` my-${my} ` : ""} 
                          w-full rounded-full dark:bg-white/5 bg-black/5`}
    />
  );
};
