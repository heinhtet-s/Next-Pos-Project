"use client";
import CategoryComponent from "@/components/dashboard/CategoryComponent";
import SellTable from "@/components/ui/SellTable";
import DashboardCard from "@/components/ui/dashboardCard";
import { categoryType } from "@/dto/response";
import { getData } from "@/lib/apiService";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { AiFillEye, AiFillPlusCircle } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { useQueryParam, StringParam, withDefault } from "use-query-params";
import Sticker from "@/assets/images/logoIcon.png";
import ModalBox from "@/components/dashboard/ModalBox";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "flowbite-react";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { ChangeEventTypes } from "@/dto/form";
import { TodayDateTime, getDay, getMonth, getYear } from "@/lib/helper";
import SearchInput from "@/components/ui/search";
import DatePicker from "@/components/ui/CustomDatePicker";
const columns = [
  {
    header: "Barcode",
    accessor: "barcode",
  },
  {
    header: "Item Name",
    accessor: "itemName",
  },
  {
    header: "Photo",
    accessor: "img",
  },
  {
    header: "Type",
    accessor: "type",
  },
  {
    header: "Buy Price",
    accessor: "buyPrice",
  },
  {
    header: "Sell Price",
    accessor: "sellPrice",
  },
  {
    header: "Stock",
    accessor: "stock",
  },
  {
    header: "Brand",
    accessor: "brand",
  },
  {
    header: "Date",
    accessor: "day",
  },
  {
    header: "Action",
    accessor: "action",
  },
];
const page = () => {
  const { data: categoryData, isLoading } = useQuery("category", () =>
    getData("/api/category")
  );
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState<string | undefined>(undefined);
  const { data: session } = useSession() as any;
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>({
    frontNumber: "",
    frontUnit: "Pcs",
    relation: {},
  });
  const AddStockHandler = (product: any) => {
    setSelectedProduct(product);

    const productDocRef = doc(
      collection(db, session.user.city, session.user.shopId, "products"),
      product.id
    );
    const relationCollectionRef = collection(productDocRef, "relation");

    onSnapshot(relationCollectionRef, (snapshot) => {
      const relations: any = [];
      snapshot.forEach((doc) => {
        relations.push(doc.data());
      });
      setSelectedRelation(relations);
      setOpenModal("dismissible");
      // //console.log(this.relations)
    });
  };
  const ChangeUnit = (e: any) => {
    let selected = "";
    selected = selectedRelation.filter((relation: any) => {
      return relation.frontUnit === e.target.value;
    });
    setSelectedUnit({
      ...selectedUnit,
      frontUnit: e.target.value,
      relation: selected[0],
    });
  };
  const queryClient = useQueryClient();
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const {
    data: PaginateProducts,
    fetchNextPage,
    hasNextPage,
    refresh,
  } = useInfiniteQuery({
    queryKey: ["products", activeCategoryId, search],
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
  const [date, setDate] = useState<any>(new Date());
  const router = useRouter();
  const rows = flattenedData?.map((item: any) => {
    return {
      ...item,
      img: (
        <img
          src={
            item?.images[0] !== "default" && item?.images.length > 0
              ? item?.images[0]
              : "https://flashmallmm.com/img/2.f86d3108.png"
          }
          alt={item?.itemName}
          className="w-10 h-10 object-cover rounded-lg"
        />
      ),
      action: (
        <div className="flex space-x-2">
          <button
            className="bg-green-500 w-fit w-24 text-white px-1 py-1 rounded-lg"
            onClick={() => AddStockHandler(item)}
          >
            Add Stock
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-lg"
            onClick={() =>
              router.push(
                `/shop-owner/inventory-control/product/${item.id}/detail`
              )
            }
          >
            Detail
          </button>
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
            onClick={() =>
              router.push(
                `/shop-owner/inventory-control/product/${item.id}/update`
              )
            }
          >
            Edit
          </button>
        </div>
      ),
    };
  });
  const updateStock = async (e: ChangeEventTypes) => {
    e.preventDefault();
    let newStock = 0;
    let count = 0;

    if (selectedUnit.frontNumber !== "") {
      if (selectedUnit.frontUnit !== "Pcs") {
        count =
          parseInt(selectedUnit.relation.backNumber) *
          parseInt(selectedUnit.frontNumber);
        newStock =
          parseInt(selectedProduct.stock) +
          parseInt(selectedUnit.relation.backNumber) *
            parseInt(selectedUnit.frontNumber);
      } else {
        count = parseInt(selectedUnit.frontNumber);
        if (selectedProduct.stock === "") {
          newStock = parseInt(selectedUnit.frontNumber);
        } else {
          newStock =
            parseInt(selectedProduct.stock) +
            parseInt(selectedUnit.frontNumber);
        }
      }

      const productDocRef = doc(
        collection(db, session.user.city, session.user.shopId, "products"),
        selectedProduct.id
      );

      try {
        // Update the stock in the product document
        console.log(newStock.toString());

        await setDoc(productDocRef, {
          ...selectedProduct,
          stock: newStock.toString(),
        });

        // Add a record in the records subcollection
        const recordsCollectionRef = collection(productDocRef, "records");
        const timestamp = Timestamp.now();

        const recordData = {
          id: selectedProduct.id,
          recordId: recordsCollectionRef.id,
          itemCode: selectedProduct.itemCode,
          barcode: selectedProduct.barcode,
          itemName: selectedProduct.itemName,
          buyPrice: selectedProduct.buyPrice,
          sellPrice: selectedProduct.sellPrice,
          stock: selectedProduct.stock.toString(),
          description: selectedProduct.description,
          type: selectedProduct.type,
          color: selectedProduct.color,
          size: selectedProduct.size,
          weight: selectedProduct.weight,
          time: timestamp,
          day: getDay(),
          month: getMonth(),
          year: getYear(),
          dateTime: TodayDateTime(),
          rating: selectedProduct.rating,
          discount: selectedProduct.discount,
          note: "default",
          process: "stockUpdate",
          count: "+" + count.toString(),
        };

        const data = await addDoc(recordsCollectionRef, recordData);

        setSelectedUnit({
          frontNumber: "",
          frontUnit: "Pcs",
          selectedRelation: {},
        });
        setSelectedRelation(null);
        setSelectedProduct(null);
        queryClient.invalidateQueries(["products", activeCategoryId, search]);
        toast.success("Stock updated successfully");
        setOpenModal(undefined);
      } catch (error) {
        console.error("Error updating stock: ", error);
      }
    } else {
    }
  };

  return (
    <DashboardCard>
      <div className="flex items-center">
        <div className="flex items-center overflow-x-auto bg-backgroundColor p-3 mt-5 rounded-lg">
          <CategoryComponent
            category={{
              id: "0",
              name: "All",
            }}
            activeCategory={activeCategoryId}
            setActiveCategory={setActiveCategoryId}
          />

          {categoryData?.categories.map((item: categoryType) => (
            <CategoryComponent
              category={item}
              activeCategory={activeCategoryId}
              setActiveCategory={setActiveCategoryId}
            />
          ))}
        </div>

        <button
          onClick={() =>
            router.push("/shop-owner/inventory-control/product/create")
          }
          className="bg-primary text-white transition p-3 rounded-lg ml-3 h-fit hover:bg-hover "
        >
          <AiFillPlusCircle className="text-lg" />
        </button>
      </div>
      <div className="flex items-center ml-5 my-3">
        <div className="w-80">
          <SearchInput setSearch={setSearch} />
        </div>
        <div className="w-80">
          {/* <DatePicker
            value={date}
            handleChange={(e: ChangeEventTypes) => {
              console.log(e.target.value);
            }}
          /> */}
        </div>
      </div>
      <div
        id="scrollableDiv"
        style={{
          height: "calc(100vh - 300px)",
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
            height: "100%",
            overflowX: "hidden",
            width: "100%",
          }}
        >
          <SellTable columns={columns} data={rows} />
        </InfiniteScroll>
      </div>
      <AddToStockModal
        product={selectedProduct}
        relations={selectedRelation}
        openModal={openModal}
        unit={selectedUnit}
        setOpenModal={setOpenModal}
        ChangeUnit={ChangeUnit}
        updateStock={updateStock}
        setUnit={setSelectedUnit}
      />
    </DashboardCard>
  );
};

const AddToStockModal = ({
  product,
  relations,
  openModal,
  setOpenModal,
  unit,
  ChangeUnit,
  setUnit,
  updateStock,
}: any) => {
  return (
    <ModalBox openModal={openModal} setOpenModal={setOpenModal}>
      <h3 className="text-center text-2xl font-bold mb-5">Add Stock</h3>
      <div className="flex justify-between">
        <p className="text-md my-2 w-1/2  ">{product?.itemName}</p>
        <p className="text-md my-2  bg-green-600 rounded-lg text-white px-2">
          {" "}
          Stock: {product?.stock} Pcs{" "}
        </p>
      </div>
      {unit.frontUnit !== "Pcs" ? (
        <span>
          1 {unit.frontUnit} = {unit?.relation?.backNumber} Pcs
        </span>
      ) : (
        ""
      )}
      <form onSubmit={updateStock}>
        <div className="flex space-x-2 mt-5">
          <Input
            className="w-1/2 "
            value={unit.frontNumber}
            onChange={(e) => {
              setUnit({
                ...unit,
                frontNumber: e.target.value,
              });
            }}
            name="count"
            type="number"
          />
          <Select
            className="w-1/2    "
            onChange={ChangeUnit}
            name="unit"
            value={unit.frontUnit}
            // value={}
            required
          >
            <option value="Pcs">Pcs</option>
            {relations?.map((item: any) => (
              <option value={item?.frontUnit}>{item?.frontUnit}</option>
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
            Add Stock
          </Button>
        </div>
      </form>
    </ModalBox>
  );
};

export default page;
