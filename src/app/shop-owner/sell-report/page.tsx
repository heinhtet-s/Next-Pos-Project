"use client";
import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, Select, TextInput } from "flowbite-react";
import { FaFileExcel } from "react-icons/fa";
import SellTable from "@/components/ui/SellTable";
import { useInfiniteQuery } from "react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData } from "@/lib/apiService";
import { formatDate, formatMonth, formatYear } from "@/lib/helper";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/ui/dashboardCard";
const columns = [
  {
    header: "Sell Type",
    accessor: "sellType",
  },
  {
    header: "Voucher No",
    accessor: "vouncherId",
  },

  {
    header: "Customer Name",
    accessor: "customerName",
  },
  {
    header: "Total",
    accessor: "totalPrice",
  },
  {
    header: "Credit",
    accessor: "credit",
  },
  {
    header: "Date",
    accessor: "dateTime",
  },
  {
    header: "Action",
    accessor: "action",
  },
];

const page = () => {
  const [dateType, setDateType] = useState("day");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
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
  console.log(ChangeDateFormatHandler());
  const {
    data: PaginateProducts,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", search, dateType, selectedDate],
    queryFn: ({ pageParam = "" }) =>
      getData(
        `/api/sellReport?search=${search}&dateType=${dateType}&selectedDate=${ChangeDateFormatHandler()}&lastIndex=${pageParam}`
      ),
    getNextPageParam: (data, total) => {
      return data?.lastIndex ? data.lastIndex : undefined;
    },
  }) as any;
  const flattenedData = useMemo(
    () =>
      PaginateProducts?.pages[0]?.data?.invoices.length > 0
        ? PaginateProducts?.pages.flatMap((item: any) => item?.data?.invoices)
        : [],
    [PaginateProducts]
  );
  const router = useRouter();
  const rows = flattenedData?.map((item: any) => {
    return {
      ...item,
      customerName: item.customerName === "" ? "unknown" : item?.customerName,
      credit: item?.credit === "0" ? "paid" : item?.credit,
      action: (
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-lg"
            onClick={() =>
              router.push(
                `/shop-owner/sell-report/${item?.vouncherId}${
                  item?.customerName === ""
                    ? ""
                    : `?custorem_id=${item?.customerId}`
                }`
              )
            }
          >
            View
          </button>
          <button className="bg-red-500 text-white px-3 py-1 rounded-lg">
            Refund
          </button>
        </div>
      ),
    };
  });

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
  return (
    <DashboardCard>
      <div className="flex items-center w-full justify-between my-2">
        <Tabs defaultValue="account" className="w-[400px] ">
          <TabsList className="bg-hover text-white ">
            <TabsTrigger value="account">Invoice</TabsTrigger>
            <TabsTrigger value="password">Sell Report</TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          <Button.Group>
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
      </div>
      <div className="flex items-center w-full justify-between my-3">
        <TextInput
          placeholder="search by vouncher number"
          id="small"
          sizing="sm"
          type="text"
          className="w-[200px]"
        />
        <div className="flex space-x-2 items-center">
          <Select className="w-[200px]" required>
            <option>All</option>
            <option>In Shop Sell</option>
            <option>Online Sell</option>
            <option>Live Sell</option>
          </Select>
          <div
            style={{
              width: "230px",
              height: "50px",
            }}
          >
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
          {/* <input
            type="month"
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #D0D0CE",
              padding: "0 20px",
              fontSize: "16px",
              fontWeight: "500",
              outline: "none",
            }}
          /> */}
          <FaFileExcel className="text-2xl cursor-pointer mx-4 text-green-500" />
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
    </DashboardCard>
  );
};

export default page;
