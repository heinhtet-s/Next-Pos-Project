"use client";
import BackBtn from "@/components/dashboard/BackBtn";
import { Button as SubmitBtn } from "@/components/ui/button";
import DashboardCard from "@/components/ui/dashboardCard";
import { Button, Select, TextInput } from "flowbite-react";
import { db } from "@/lib/firebase";
import {
  ExportPhothHandler,
  formatDate,
  formatMonth,
  formatYear,
} from "@/lib/helper";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Barcode from "react-barcode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const page = () => {
  const barcodeRef = React.useRef(null);
  const [dateType, setDateType] = useState("day");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  const [owner, setOwner] = useState(null);

  const ChangeDateFormatHandler = () => {
    switch (dateType) {
      case "day":
        return formatDate(selectedDate);
      case "month":
        return formatMonth(selectedDate);
      case "year":
        return formatYear(selectedDate);
    }
  };
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [stockHistories, setStockHistories] = useState<any>([]);
  const [filterStockHistories, setFilterStockHistories] = useState<any>([]);
  const [relations, setRelations] = useState<any>([]);
  const { id } = useParams() as any;
  const { data: session, status } = useSession() as any;
  const DateFormatHandler = () => {
    switch (dateType) {
      case "day":
        return "dd/MM/yyyy";
      case "month":
        return "MM/yyyy";
      case "year":
        return "yyyy";
    }
  };
  const getBadgeColor = (process: any) => {
    switch (process) {
      case "offlineSell":
        return "bg-primary";
      case "add":
        return "bg-primary";
      case "onlineSell":
        return "bg-yellow-500";
      case "liveSell":
        return "bg-red-500";
      case "infoUpdate":
        return "bg-green-500";
      case "buyPrice":
      case "sellPrice":
        return "bg-slate-800";
      case "stockUpdate":
        return "bg-green-500";
      case "waste":
        return "bg-red-500";
      case "refund":
        return "bg-yellow-500";
      default:
        return "bg-primary";
    }
  };

  // Helper function to get process message based on history.process
  const getProcessMessage = (process: any) => {
    switch (process.process) {
      case "offlineSell":
        return "In-shop sell";
      case "add":
        return "First added";
      case "onlineSell":
        return "Online sell";
      case "liveSell":
        return "Live sell";
      case "infoUpdate":
        return "Info update";
      case "buyPrice":
      case "sellPrice":
        return process.note;
      case "stockUpdate":
        return "Stock update";
      case "waste":
        return "Waste";
      case "refund":
        return "Refund";
      default:
        return "";
    }
  };
  useEffect(() => {
    const fetchProductHistory = async () => {
      if (!session?.user?.city || !session?.user?.shopId) return;
      const city = session?.user?.city;
      const shopId = session?.user?.shopId;
      const productDocRef = doc(db, city, shopId, "products", id);

      const productSnapshot = await getDoc(productDocRef);
      setCurrentProduct(productSnapshot.data());

      const recordsQuery = query(
        collection(db, city, shopId, "products", id, "records"),
        where(dateType, "==", ChangeDateFormatHandler()),
        orderBy("time", "desc")
      );

      const recordsSnapshot = await getDocs(recordsQuery);
      const recordsData = recordsSnapshot.docs.map((doc) => doc.data());
      console.log(recordsData, "recordsData");
      setStockHistories(recordsData);
      setFilterStockHistories(recordsData);

      const relationSnapshot = await getDocs(
        collection(db, city, shopId, "products", id, "relation")
      );

      const relationData = relationSnapshot.docs.map((doc) => doc.data());
      setRelations(relationData);
    };
    fetchProductHistory();
  }, [dateType, selectedDate, session?.user?.city, session?.user?.shopId, id]);
  console.log(currentProduct, "currentProduct");
  return (
    <div className="w-full">
      <BackBtn text="Product Detail" />
      <DashboardCard>
        <div className="grid grid-cols-3 gap-4 w-full ">
          <div className="col-span-1">
            <div>
              <img
                src="https://flashmallmm.com/img/1.3fea48ca.png"
                className="w-full  my-2 block"
              />
            </div>
            <div className="border ">
              <div ref={barcodeRef}>
                <Barcode value="barcode-example" width={1} />
              </div>
              <SubmitBtn onClick={() => ExportPhothHandler(barcodeRef.current)}>
                Save
              </SubmitBtn>
            </div>
          </div>
          <div className="col-span-1 bg-slate-100 rounded-md p-2 px-4">
            <h2 className="text-2xl mb-2 ">Product Name</h2>
            <div className="flex justify-between mb-2">
              <p>Item Code</p>
              <p>{currentProduct?.itemCode}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Barcode</p>
              <p>{currentProduct?.barcode}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Discount</p>
              <p>{currentProduct?.discount}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Stock</p>
              <p>{currentProduct?.stock}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Buy Price</p>
              <p className="text-yellow-600">{currentProduct?.buyPrice}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Sell Price</p>
              <p className="text-green-600">{currentProduct?.sellPrice}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Type</p>
              <p className="">{currentProduct?.type}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Color</p>
              <p className="">{currentProduct?.color}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Size</p>
              <p className="">{currentProduct?.size}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Weight</p>
              <p className="">{currentProduct?.weight}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Description</p>
              <p className="">{currentProduct?.description}</p>
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex justify-end mb-2">
              <Button.Group className="ml-auto">
                <Button
                  className="focus:outline-none focus:ring-0 focus:border-none"
                  color={dateType === "day" ? "blue" : "light"}
                  onClick={() => setDateType("day")}
                >
                  Daily
                </Button>

                <Button
                  className="focus:outline-none focus:ring-0 focus:border-none"
                  color={dateType === "month" ? "blue" : "light"}
                  onClick={() => setDateType("month")}
                >
                  Monthly
                </Button>
                <Button
                  className="focus:outline-none focus:ring-0 focus:border-none"
                  color={dateType === "year" ? "blue" : "light"}
                  onClick={() => setDateType("year")}
                >
                  Yearly
                </Button>
              </Button.Group>
            </div>
            <div className="flex justify-between items-center mt-5">
              <h3 className="text-lg">Product Detail</h3>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showIcon
                icon={
                  <svg
                    className="mt-2.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 48 48"
                  >
                    <mask id="ipSApplication0">
                      <g
                        fill="none"
                        stroke="#fff"
                        strokeLinejoin="round"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          d="M40.04 22v20h-32V22"
                        ></path>
                        <path
                          fill="#fff"
                          d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                        ></path>
                      </g>
                    </mask>
                    <path
                      fill="currentColor"
                      d="M0 0h48v48H0z"
                      mask="url(#ipSApplication0)"
                    ></path>
                  </svg>
                }
                showYearPicker={dateType === "year" ? true : false}
                showMonthYearPicker={dateType === "month" ? true : false}
                dateFormat={DateFormatHandler()}
                placeholderText={DateFormatHandler()}
                className="w-50 pl-8 py-2  mt-1 text-gray-700 border rounded-lg focus:outline-none focus:border-none"
                // placeholderText="YYYY"
              />
            </div>
            {/* {filterStockHistories?.map((history: any, index: number) => (
              <div key={index} className="bg-slate-100 rounded-md p-2 my-2">
                <div className="flex justify-between items-center">
                  <div className="py-1 px-2 text-sm rounded-md h-fit bg-primary text-white ">
                    {history?.process}
                  </div>
                  <div className="py-1 px-2 text-lg  font-light ">
                    Stock: {history.count}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="py-1 px-2 text-sm font-light ">
                    {history.dateTime}
                  </div>
                  <div className="py-1 px-2 text-lg  font-light ">18</div>
                </div>
              </div>
            ))} */}
            <div>
              {filterStockHistories.map((history: any, index: number) => (
                <div
                  key={index}
                  className="p-1 mb-2 bg-gray-100 border rounded"
                >
                  <div className="p-1 flex justify-between">
                    <span
                      className={`badge my-1 rounded text-white ${getBadgeColor(
                        history.process
                      )}`}
                    >
                      {getProcessMessage(history)}
                    </span>

                    {/* {history.image && (
                      <div onClick={() => openImage(history)}>
                        <img
                          src={history.image}
                          className="border border-1 border-primary rounded p-1"
                          width="40"
                          height="40"
                          alt="Product Image"
                        />
                      </div>
                    )} */}
                    {history.stock && history.process === "stockUpdate" ? (
                      <span className="fs-5">
                        Stock : {+history.stock + Number(history.count)}
                      </span>
                    ) : (
                      <span className="fs-5">Stock : {+history.stock}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: "12px" }}>{history.dateTime}</span>
                    <div className="flex">
                      {history.process === "discountUpdate" && (
                        <span className="text-primary text-lg">
                          {history.discount} %
                        </span>
                      )}
                      {history.count !== "0" && (
                        <span
                          className={`text-lg ${
                            history.count < 0 ? "text-danger" : "text-success"
                          }`}
                        >
                          {history.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {(history.process === "received" ||
                    history.process === "transfer" ||
                    history.process === "refund") && (
                    <div>
                      <span>{history.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default page;
