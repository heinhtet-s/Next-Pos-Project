"use client";

import DashboardCard from "@/components/ui/dashboardCard";
import { Input } from "@/components/ui/input";
import React, { ChangeEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { categoryType, productType, relationType } from "@/dto/response";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { db } from "@/lib/firebase";
import ProductImg from "@/assets/images/product.png";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { AddToCart } from "@/lib/store/productSlice";
import { CartNumber } from "@/dto/utils";
import AddToCartTable from "./addToCardTable";
import { Modal, Select } from "flowbite-react";
import { Button } from "@/components/ui/button";
import { ChangeEventTypes } from "@/dto/form";
import CategoryComponent from "@/components/dashboard/CategoryComponent";
import SearchInput from "@/components/ui/search";
import ProductCard from "@/components/dashboard/Product/ProductCardComponent";
import ProductDetailModal from "@/components/dashboard/Product/ProductDetailModal";
interface ProductDisplayProps {
  activeCategoryId: string;
  setActiveCategoryId: React.Dispatch<React.SetStateAction<string>>;
  categoryData: categoryType[];
  fetchNextPage: () => void;
  flattenedData: productType[];
  hasNextPage: boolean;
  session: any;
  cartNumber: CartNumber;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}
export type RelationProductDataType = {
  relationData: relationType[];
} & productType;
export type initalDataForRelationType = {
  unit: string;
  count: number;
};
const initalDataForRelation = {
  unit: "pic",
  count: 1,
};

export default function ProductDisplayComponent({
  activeCategoryId,
  setActiveCategoryId,
  categoryData,
  fetchNextPage,
  flattenedData,
  hasNextPage,
  session,
  cartNumber,
  setSearch,
}: ProductDisplayProps) {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [relationProductData, setRelationProductData] =
    useState<RelationProductDataType>({} as RelationProductDataType);
  const [relationData, setRelationData] = useState<initalDataForRelationType>(
    initalDataForRelation
  );
  const handleRelationDataChange = (e: ChangeEventTypes) => {
    if (e.target.name === "count" && e.target.value == "0") {
      setRelationData({
        ...relationData,
        [e.target.name]: 1,
      });
      return;
    }
    setRelationData({
      ...relationData,
      [e.target.name]: e.target.value,
    });
  };
  const handleOpenModal = () => {
    setRelationData(initalDataForRelation);
    setOpenModal("dismissible");
  };

  const addToCart = async (product: productType) => {
    const relationQuery = query(
      collection(
        db,
        session.user.city,
        session.user.shopId,
        "products",
        product.id,
        "relation"
      )
    );

    const relationQuerySnapshot = await getDocs(relationQuery);
    const relationData = relationQuerySnapshot.docs.map((doc) =>
      doc.data()
    ) as relationType[];
    if (relationData.length === 0) {
      dispatch(
        AddToCart({
          id: product.id,
          name: product.itemName,
          price: product.sellPrice,
          unit: "pcs",
          unitRelation: 1,
          qty: 1,
          stock: product.stock,
          cartNumber: cartNumber || "one",
          buyPrice: product.buyPrice,
        })
      );
    } else {
      setRelationProductData({
        ...product,
        relationData,
      });
      handleOpenModal();
    }
  };

  const addToCartRelation = (product: RelationProductDataType) => {
    console.log(product.relationData);
    console.log(relationData.unit);
    let unitRelation: any = product.relationData.find(
      (item: relationType) => item.frontUnit == relationData.unit
    );
    unitRelation = unitRelation ? +unitRelation.backNumber : 1;
    console.log(unitRelation);
    dispatch(
      AddToCart({
        id: product.id,
        name: product.itemName,
        price: product.sellPrice,
        unit: relationData.unit,
        unitRelation: unitRelation,
        qty: relationData.count,
        stock: product.stock,
        cartNumber: cartNumber || "one",
        buyPrice: product.buyPrice,
      })
    );
    setOpenModal(undefined);
  };
  const props = {
    openModal,
    setOpenModal,
    productData: relationProductData,
    handleChange: handleRelationDataChange,
    addToCartRelation,
    relationData,
  };
  return (
    <div
      style={{
        flex: "0 0 550px",
        maxWidth: "550px",
      }}
    >
      <DashboardCard>
        <div className="flex items-center bg-backgroundColor p-3 rounded-lg">
          <div className="pr-2 cursor-pointer">
            <AiOutlineSearch className="text-xl" />
          </div>
          <SearchInput setSearch={setSearch} />
        </div>
        <div className="flex items-center overflow-x-auto bg-backgroundColor p-3 mt-5 rounded-lg">
          <CategoryComponent
            category={{
              id: "0",
              name: "All",
            }}
            activeCategory={activeCategoryId}
            setActiveCategory={setActiveCategoryId}
          />

          {categoryData?.map((item: categoryType) => (
            <CategoryComponent
              category={item}
              activeCategory={activeCategoryId}
              setActiveCategory={setActiveCategoryId}
            />
          ))}
        </div>
        <div
          id="scrollableDiv"
          style={{
            height: "calc(100vh - 42px - 300px)",
          }}
          className="  overflow-y-auto bg-backgroundColor  mt-5 rounded-lg w-full"
        >
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={hasNextPage || false}
            loader={<p>Loading...</p>}
            dataLength={flattenedData?.length || 0}
            scrollableTarget="scrollableDiv"
            style={{
              display: "flex",
              overflowY: "auto",
              flexWrap: "wrap",

              overflowX: "hidden",
              width: "100%",
            }}
          >
            {flattenedData?.map((item: productType, i: number) => (
              <div
                className=" w-1/3 p-1.5  "
                key={item?.id}
                onClick={() => addToCart(item)}
              >
                <div className="bg-white w-full bg-white">
                  <ProductCard product={item} />
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
        {Object.keys(relationProductData).length !== 0 && (
          <ProductDetailModal {...props} />
        )}
      </DashboardCard>
    </div>
  );
}
