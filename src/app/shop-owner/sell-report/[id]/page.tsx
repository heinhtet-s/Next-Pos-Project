"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "react-query";
import { getData } from "@/lib/apiService";
import { AiTwotonePhone } from "react-icons/ai";
import BackBtn from "@/components/dashboard/BackBtn";
import { IoSaveSharp } from "react-icons/io5";
import { BiSolidPrinter } from "react-icons/bi";
import { ExportPhothHandler } from "@/lib/helper";
import { useReactToPrint } from "react-to-print";
const page = () => {
  const { data: session } = useSession() as any;
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInvoice, setCustomerInvoice] = useState<any>({});
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const param = useSearchParams();
  const { id } = useParams();
  let customerId = param.get("custorem_id");
  useQuery(
    ["customer", customerId, id],
    () => getData(`/api/sellReport/${id}?customer_id=${customerId}`),
    {
      onSuccess: (data) => {
        setSelectedCustomer(data?.data?.customerDetail);
        setCustomerInvoice(data?.data?.voucherDetail);
        setPaymentHistory(data?.data?.paymentHistory);
      },
    }
  );

  const VouncherRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => VouncherRef.current,
    onAfterPrint: () => {
      // Reset the Promise resolve so we can print again
      console.log("done");
    },
  });
  return (
    <div>
      <BackBtn text={"Voucher Detail"} />
      <div
        className="grid grid-cols-6 gap-2  "
        style={{
          height: "calc(100vh - 150px)",
        }}
      >
        <div
          className="col-span-3  bg-white p-5 rounded-md"
          style={{
            overflowY: "scroll",
            overflowX: "hidden",
            height: "100%",
          }}
        >
          <div className="flex justify-end items-center space-x-5">
            <button
              className="text-lg font-normal hover:scale-110 transition my-3"
              onClick={() => ExportPhothHandler(VouncherRef.current)}
            >
              <IoSaveSharp className="inline-block" />
            </button>
            <button
              onClick={handlePrint}
              className="text-lg font-normal hover:scale-110 transition my-3"
            >
              <BiSolidPrinter className="inline-block" />
            </button>
          </div>
          <VoucherDisplay
            customerInvoice={customerInvoice}
            VouncherRef={VouncherRef}
            session={session}
          />
        </div>
        <div className="bg-white col-span-2 p-5 rounded-md">
          <h3 className="text-center font-bold text-lg ">Payment History</h3>
          {paymentHistory?.map((item, index) => (
            <PaymentHistoryItem key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
const PaymentHistoryItem = ({ item }: { item: any }) => {
  return (
    <div className="bg-backgroundColor p-3  font-normal  rounded-lg text-sm  mb-2">
      <p
        className="
    font-light 
    "
      >
        {item?.dateTime}
      </p>
      <div className="flex justify-between align-center mt-1">
        <p
          className="
    font-normal text-green-500
    "
        >
          {item?.paymentMethod + " Received"}
        </p>
        <p>{item?.cashReceived}</p>
      </div>
      {item?.credit !== "0" && (
        <div className="flex justify-between align-center mt-1">
          <p>Credit</p>
          <p className="text-red-500"> {item?.credit}</p>
        </div>
      )}
      {item?.change !== "0" && (
        <div className="flex justify-between align-center mt-1">
          <p className="text-green-500">Change</p>
          <p> {item?.change}</p>
        </div>
      )}
      <p>{item?.note}</p>
    </div>
  );
};
const VoucherDisplay = ({
  customerInvoice,
  VouncherRef,
  session,
}: {
  customerInvoice: any;
  VouncherRef: React.Ref<HTMLDivElement>;
  session: any;
}) => {
  return (
    <div
      ref={VouncherRef}
      className=" text-[12px] mr-5 mt-5  font-[700]  bg-white p-[16px] rounded-md w-full"
    >
      <div className="border-b-2 border-black text-center pb-2">
        <h1 className="font-bold  text-[1.25rem]">{session?.user?.name}</h1>
        <p className=" my-2">{session?.user?.address}</p>
        <p className="">
          <AiTwotonePhone className="inline-block mr-2" />
          {session?.user?.phone}
        </p>
      </div>
      <p className="my-1">Voucher No {customerInvoice.vouncherId} </p>
      <p className="my-1">{"Date: " + customerInvoice.dateTime}</p>
      <table
        className=" w-full "
        style={{
          captionSide: "bottom",
          textIndent: "initial",
          borderSpacing: "2px",
          padding: "0px",
        }}
      >
        <thead>
          <tr
            className="[&>th]:p-[8px] "
            style={{
              borderBottom: "2px dotted black !important",
              borderRight: "0 !important",
              borderLeft: "0 !important",
              borderTop: "0 !important",
            }}
          >
            <th className="text-start">Items</th>
            <th className="text-start">Qty</th>
            <th className="text-start">Price</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {customerInvoice?.nameList?.map((item: string[], index: number) => (
            <tr className="[&>td]:p-[8px] mb-1  " key={index}>
              <td>{item}</td>
              <td>
                {customerInvoice?.countList?.[index] +
                  " " +
                  customerInvoice?.productUnitList?.[index]}
              </td>
              <td>{customerInvoice?.sellPriceList?.[index]}</td>
              <td className="text-end">
                {customerInvoice?.costPerItem?.[index] + "KS"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
          <p> Total</p>
          <p>{parseInt(customerInvoice.totalPrice).toLocaleString()}</p>
        </div>
        {session?.user?.tax !== "0" && (
          <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
            <p> Tax</p>
            <p>{session?.user?.tax.toLocaleString()}</p>
          </div>
        )}
        {customerInvoice?.discount !== "0" && (
          <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
            <p> Discount</p>
            <p>{customerInvoice?.discount?.toLocaleString()}</p>
          </div>
        )}

        <div className="flex justify-between py-1  px-2 border-t-2  border-dotted border-black ">
          <p> Net Amount</p>
          <p> {parseInt(customerInvoice?.totalPrice).toLocaleString()}</p>
        </div>
        <div className="flex justify-between py-1  px-2  ">
          <p> {customerInvoice?.paymentMethod} Received</p>
          <p>{parseInt(customerInvoice.cashReceived).toLocaleString()}</p>
        </div>
        {customerInvoice.credit > 0 && (
          <div className="flex justify-between py-1  px-2  ">
            <p> Credit</p>
            <p>{parseInt(customerInvoice.credit).toLocaleString()}</p>
          </div>
        )}

        <div className="flex justify-between py-1  px-2 border-t-2  border-dotted border-black ">
          <p> Charge</p>
          <p> {parseInt(customerInvoice.change).toLocaleString()} </p>
        </div>
      </div>
      <div className="flex flex-col justify-between w-full items-center my-2 mb-5 ">
        <p>Thank you</p>
        <img
          src="https://flashmallmm.com/img/2.f86d3108.png"
          className="w-[35px] h-[35px] my-2 block"
        />
        <p className="font-light">Power by Light Idea Software Development</p>
      </div>
    </div>
  );
};
export default page;
