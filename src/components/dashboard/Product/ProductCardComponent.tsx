import React from "react";
import Sticker from "@/assets/images/logoIcon.png";
import { Card } from "@/components/ui/card";
import { productType } from "@/dto/response";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const ProductCard = ({ product }: { product: productType }) => {
  return (
    <Card className="relative cursor-pointer transition hover:bg-primaryHover ">
      <div className="absolute top-1 right-2">
        <Badge variant="default" className="text-xs py-0 px-2">
          {product.stock}
        </Badge>{" "}
      </div>
      <ProductImage images={product.images} />
      <div className="p-5">
        <a href="#">
          <h5 className="mb-2 text-sm truncate font-bold tracking-tight text-gray-900 dark:text-white">
            {product.itemName}
          </h5>
        </a>
        <p className="mb-3 font-bold opacity-30 text-sm   text-gray-700 dark:text-gray-400">
          {product.itemCode}
        </p>
        <p
          className="
          text-sm font-bold text-primary"
        >
          {product.sellPrice}
        </p>
      </div>
    </Card>
  );
};

const ProductImage = ({ images }: { images: string[] }) => {
  return (
    <div>
      <Image
        className="rounded-t-lg m-auto"
        height="100"
        width="120"
        src={images.length > 0 && images[0] !== "default" ? images[0] : Sticker}
        alt=""
      />
    </div>
  );
};

export default ProductCard;
