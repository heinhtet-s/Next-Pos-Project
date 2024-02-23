import { useRouter } from "next/navigation";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";

const BackBtn = ({ text, link }: { text: string; link?: string }) => {
  const router = useRouter();
  return (
    <button
      className="text-lg font-normal hover:scale-110 transition my-2"
      onClick={() => {
        link ? router.push(link) : router.back();
      }}
    >
      <IoIosArrowBack className="inline-block" />
      {text}
    </button>
  );
};

export default BackBtn;
