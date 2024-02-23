import React from "react";
import { Modal, Select } from "flowbite-react";
import { Button } from "@/components/ui/button";
import {
  RelationProductDataType,
  initalDataForRelationType,
} from "@/app/shop-owner/sell-product/productDisplay";
import { ChangeEventTypes } from "@/dto/form";
import Image from "next/image";
import ProductImg from "@/assets/images/product.png";
import { relationType } from "@/dto/response";
import { Input } from "@/components/ui/input";

const ProductDetailModal = ({
  openModal,
  setOpenModal,
  productData,
  addToCartRelation,
  relationData,
  handleChange,
}: {
  openModal: string | undefined;
  setOpenModal: React.Dispatch<React.SetStateAction<string | undefined>>;
  productData: RelationProductDataType;
  addToCartRelation: (product: RelationProductDataType) => void;
  relationData: initalDataForRelationType;
  handleChange: (e: ChangeEventTypes) => void;
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToCartRelation(productData);
  };
  return (
    <Modal
      size="md"
      className="z-[9999] "
      dismissible
      show={openModal === "dismissible"}
      onClose={() => setOpenModal(undefined)}
    >
      <Modal.Body className="px-10">
        <div className="flex justify-center mb-5 space-x-6 items-center">
          <Image
            src={
              productData?.images?.length > 0 &&
              productData?.images[0] !== "default"
                ? productData?.images[0]
                : ProductImg
            }
            width={120}
            alt=""
          />
          <div>
            <p className="text-md my-2 ">{productData.itemName}</p>
            <p className="text-md my-2 ">Stock : {productData.stock}</p>
            <p className="text-md my-2 ">Barcode: {productData.barcode}</p>
          </div>
        </div>
        <div className="bg-primaryHover text-center p-2 rounded-sm my-2">
          <p className="text-sm">1 pic = {productData.sellPrice} </p>
        </div>
        {productData.relationData.map((item: relationType) => (
          <div
            key={item.id}
            className="bg-primaryHover text-center p-2 rounded-sm my-2"
          >
            <p className="text-sm">
              {item.frontNumber + item?.frontUnit} (
              {item?.backUnit + item.backNumber}) = {productData.sellPrice}
            </p>
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2 mt-5">
            <Input
              className="w-1/2 "
              value={relationData.count}
              onChange={handleChange}
              name="count"
              type="number"
            />
            <Select
              className="w-1/2    "
              onChange={handleChange}
              name="unit"
              value={relationData.unit}
              required
            >
              <option value="pic">pic</option>
              {productData.relationData.map((item: relationType) => (
                <>
                  <option value={item.frontUnit}>{item?.frontUnit}</option>
                </>
              ))}
            </Select>
          </div>
          <div className="flex space-x-2 mt-5">
            <Button
              variant="outline"
              onClick={() => setOpenModal(undefined)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button variant="default" type="submit" className="w-1/2">
              Add to Cart
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
export default ProductDetailModal;
