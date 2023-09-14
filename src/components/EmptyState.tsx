import Image from "next/image";

export const EmptyState = () => {
  return (
    <div>
      <Image
        src="/images/hay.png"
        className={`mx-auto pt-20 opacity-80`}
        alt="hay"
        width={180}
        height={180}
      />
      <p className={`pt-10 text-center italic text-gray-500`}>
        Not much going on down here...
      </p>
    </div>
  );
};
