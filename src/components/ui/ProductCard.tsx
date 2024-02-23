"use client";
import React from "react";
import { Card } from "./card";
import Sticker from "../../assets/images/logoIcon.png";
import Image from "next/image";
import { Badge } from "./badge";

const ProductCard = () => {
  return (
    <Card className="relative">
      <div>
        <Image
          className="rounded-t-lg m-auto"
          height="120"
          src={Sticker}
          alt=""
        />
      </div>
      <div className="absolute top-1 right-2">
        <Badge variant="default" className="text-xs py-0 px-2">
          15 pic
        </Badge>{" "}
      </div>
      <div className="p-5">
        <a href="#">
          <h5 className="mb-2 text-sm truncate font-bold tracking-tight text-gray-900 dark:text-white">
            10mm cable clip
          </h5>
        </a>
        <p className="mb-3 font-bold opacity-30 text-sm   text-gray-700 dark:text-gray-400">
          fwefef2333333
        </p>
        <p
          className="
text-sm font-bold text-primary"
        >
          300K
        </p>
      </div>
    </Card>
  );
};

export default ProductCard;
