export const Separator = ({ height, mx, my }: { height: number; mx?: number; my?: number }) => {
  return <div className={`h-[${height}px] ${mx ? ` mx-${mx} ` : ""} ${my ? ` my-${my} ` : ""} w-full rounded-full bg-white/5`} />;
};
