"use client";
import { useQueryParam, StringParam, withDefault } from "use-query-params";
import React, { use, useEffect, useMemo, useState } from "react";
import { AiOutlineSearch, AiTwotoneDelete } from "react-icons/ai";
import { categoryType, productType } from "@/dto/response";
import { getData } from "@/lib/apiService";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useQuery } from "react-query";
import { CartNumber } from "@/dto/utils";
import AddToCartTable from "./addToCardTable";
import ProductDisplayContainer from "@/components/dashboard/Product/ProductDisplayContainer";

export default function SellProductService({ session }: { session: any }) {
  const { data: categoryData, isLoading } = useQuery("category", () =>
    getData("/api/category")
  );

  const [cartNumber, setCartNumber] = useQueryParam<CartNumber>("cartNumber");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [search, setSearch] = useState("");

  const {
    data: PaginateProducts,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", { categoryData, search }],
    queryFn: ({ pageParam = "" }) =>
      getData(
        `/api/product?search=${encodeURIComponent(search)}&category=${
          activeCategoryId === "All" ? "" : encodeURIComponent(activeCategoryId)
        }&lastIndex=${pageParam}`
      ),
    getNextPageParam: (data, total) => {
      return data?.lastIndex ? data.lastIndex : undefined;
    },
  }) as any;
  const flattenedData = useMemo(
    () =>
      PaginateProducts
        ? PaginateProducts?.pages.flatMap((item: any) => item.products)
        : [],
    [PaginateProducts]
  );

  const productDisplayProps = {
    activeCategoryId,
    setActiveCategoryId,
    categoryData: categoryData?.categories,
    flattenedData: flattenedData || [],
    fetchNextPage,
    hasNextPage,
    session,
    cartNumber: cartNumber || "one",
    setCartNumber,
    setSearch,
    type: "sellProduct",
  };
  return (
    <div className="flex space-x-2 w-full ">
      <ProductDisplayContainer {...productDisplayProps} />
      <div className="w-full">
        <AddToCartTable
          cartNumber={cartNumber || "one"}
          setCartNumber={setCartNumber}
        />
      </div>
    </div>
  );
}
