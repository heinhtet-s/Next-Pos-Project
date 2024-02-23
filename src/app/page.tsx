"use client";
import * as z from "zod";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboardCard";
import SellTable from "@/components/ui/SellTable";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import axios from "axios";
import { AiTwotonePhone } from "react-icons/ai";
import { Toast } from "flowbite-react";
import { HiFire } from "react-icons/hi";
import { useState } from "react";
import { toast } from "react-toastify";
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please Enter Email" })
    .email("This is not a valid email."),
  password: z.string().min(1, { message: "Please Enter Password" }),
});
export default function Home() {
  const notify = () => toast("Wow so easy!");
  const [showToast, setShowToast] = useState(false);
  return (
    <div className="bg-backgroundColor w-full  h-screen">
      <button onClick={notify}>Notify!</button>
      {/* <div className=" text-[12px] m-5  font-[700]  bg-white p-[16px] rounded-md w-[600px]">
        <div className="border-b-2 border-black text-center pb-2">
          <h1 className="font-bold  text-[1.25rem]">
            K TWO Trading ( လျှပ်စစ်ပစ္စည်းအမျိုးမျိုးရောင်းဝယ်ရေး)
          </h1>
          <p className=" my-2">
            အခန်း(A1,A2) အထက(၄) မုဒ်ဦးအနီး၊ဘူတာလမ်း၊ရပ်ကွက်(၁၀) လားရှိုးမြို့။
          </p>
          <p className="">
            <AiTwotonePhone className="inline-block mr-2" />
            09403700313, 09403760158, 095261564
          </p>
        </div>
        <p className="my-1">Voucher No KTOAD23100300001</p>
        <p className="my-1">Date: 03-Oct-2023 9:32 AM</p>
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
            <tr className="[&>td]:p-[8px] mb-1  ">
              <td>1" Screw အမဲ </td>
              <td>1 Pcs </td>
              <td>200</td>
              <td className="text-end">Amount</td>
            </tr>
            <tr className="[&>td]:p-[8px] mb-1  ">
              <td>1" Screw အမဲ </td>
              <td>1 Pcs </td>
              <td>200</td>
              <td className="text-end">Amount</td>
            </tr>
          </tbody>
        </table>
        <div>
          <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
            <p> Total</p>
            <p>100 Ks</p>
          </div>
          <div className="flex justify-between py-1  px-2 border-t-2  border-dotted border-black ">
            <p> Net Amount</p>
            <p>100 Ks</p>
          </div>
          <div className="flex justify-between py-1  px-2  ">
            <p> Cash Received</p>
            <p>100 Ks</p>
          </div>
          <div className="flex justify-between py-1  px-2 border-t-2  border-dotted border-black ">
            <p> Charge</p>
            <p>100 Ks</p>
          </div>
        </div>
        <div className="flex justify-between w-full flex-column items-center my-2 mb-5 ">
          <p>Thank you</p>
          <img
            src="https://flashmallmm.com/img/2.f86d3108.png"
            className="w-[35px] h-[35px] my-2 block"
          />
          <p className="font-light">Power by Light Idea Software Development</p>
        </div>
      </div> */}
    </div>
  );
}
