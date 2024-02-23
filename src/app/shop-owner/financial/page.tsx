"use client";
import BackBtn from "@/components/dashboard/BackBtn";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import DashboardCard from "@/components/ui/dashboardCard";
import { getData } from "@/lib/apiService";
import { formatDate, formatMonth } from "@/lib/helper";
import React, { useState } from "react";
import { FaGreaterThan } from "react-icons/fa";
import { useQuery } from "react-query";

const page = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  const { data, isLoading } = useQuery(
    [
      "financial",
      {
        day: selectedDate,
        month: selectedMonthDate,
      },
    ],
    () =>
      getData(
        `/api/financial?day=${formatDate(selectedDate)}&month=${formatMonth(
          selectedMonthDate
        )}`
      )
  );

  return (
    <div className="w-full">
      <BackBtn text="Financial Report" />
      <DashboardCard>
        <div className="w-1/2">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-xl font-semibold">Daily Report</h1>
            <CustomDatePicker
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
              dateType="day"
            />
          </div>
          <div className="flex w-full justify-between items-center space-x-4">
            <div className="bg-backgroundColor mt-3 mb-2 rounded-lg p-4 w-1/2">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-md text-green-500 font-semibold">Income</h1>
                <button
                  className="
                 
                  text-black
                  rounded-lg
                 text-md
                  flex
                  items-center

                "
                >
                  <FaGreaterThan />
                </button>
              </div>
              <h1 className="text-2xl  mt-4 font-semibold">
                {data?.data?.paymentReceives + data?.data?.additionalIncomes} Ks
              </h1>
            </div>
            <div className="bg-backgroundColor mt-3 mb-2 rounded-lg p-4 w-1/2">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-md text-red-500 font-semibold">Expense</h1>
                <button
                  className="
                 
                  text-black
                  rounded-lg
                 text-md
                  flex
                  items-center

                "
                >
                  <FaGreaterThan />
                </button>
              </div>
              <h1 className="text-2xl  mt-4 font-semibold">
                {data?.data?.expenseTotalAmount} Ks
              </h1>
            </div>
          </div>
          <div className="flex w-full justify-between items-center space-x-4 mb-3">
            <div className="bg-backgroundColor mt-3 mb-2 rounded-lg p-4 w-full">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-md text-green-500 font-semibold">
                  Remain Amount
                </h1>
              </div>
              <h1 className="text-2xl  mt-4 font-semibold">
                {data?.data?.paymentReceives +
                  data?.data?.additionalIncomes -
                  data?.data?.expenseTotalAmount || 0}{" "}
                Ks
              </h1>
            </div>
          </div>
          <div className="flex w-full justify-between items-center">
            <h1 className="text-xl font-semibold">Current Inventory</h1>
            <CustomDatePicker
              selectedDate={selectedMonthDate}
              handleDateChange={(date: Date) => {
                setSelectedMonthDate(date);
              }}
              dateType="month"
            />
          </div>
          <div className=" w-full  ">
            <div className="bg-backgroundColor mt-3 mb-2 rounded-lg p-4 w-full">
              <h1 className="text-xl mb-3 font-semibold">Monthly Report</h1>
              <div className="flex w-full justify-between items-center">
                <h1 className="text-md text-green-500 font-semibold">
                  Total Invoice
                </h1>
                <p className="text-blue-500">Profit</p>
              </div>
              <div className="flex w-full justify-between items-center">
                <h1 className="text-xl  mt-4 font-semibold">
                  {data?.data?.monthlyIncome?.inVoiceCount}{" "}
                </h1>
                <h1 className="text-xl  mt-4 font-semibold">
                  {" "}
                  {data?.data?.monthlyIncome?.resultMonthlyProfit}
                </h1>
              </div>
            </div>
            <div className="bg-backgroundColor mt-3 mb-2 rounded-lg p-4 w-full">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-md text-green-500 font-semibold">
                  Capital
                </h1>
                <p className="text-blue-500">Profit</p>
              </div>
              <div className="flex w-full justify-between items-center">
                <h1 className="text-xl  mt-4 font-semibold">
                  {data?.data?.capital}{" "}
                </h1>
                <h1 className="text-xl  mt-4 font-semibold">
                  {data?.data?.sellIncome} Ks
                </h1>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default page;
