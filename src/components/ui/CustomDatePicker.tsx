"use client";
import React from "react";
import { formatDate, formatMonth, formatYear } from "@/lib/helper";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const CustomDatePicker = ({
  selectedDate,
  handleDateChange,
  dateType,
}: {
  selectedDate: Date;
  handleDateChange: (date: Date) => void;
  dateType: string;
}) => {
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
  // const DateFormatHandler = () => {
  //   switch (dateType) {
  //     case "day":
  //       return formatDate(selectedDate);
  //     case "month":
  //       return formatMonth(selectedDate);
  //     case "year":
  //       return formatYear(selectedDate);
  //   }
  // };
  // console.log(DateFormatHandler());
  return (
    <ReactDatePicker
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
            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
              <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
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
  );
};

export default CustomDatePicker;
