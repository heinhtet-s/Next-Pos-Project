"use client";
import React from "react";
import Aside from "./Sidebar";
import { GroupSideBarData } from "@/constant/NavConstant";
import styled from "styled-components";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [openMenu, setOpenMenu] = React.useState(true);
  return (
    <div className="flex h-screen flex-col font-semibold  ">
      <div className="bg-primary flex justify-between items-center text-white p-2 text-sm ">
        <p>K TWO Trading ( လျှပ်စစ်ပစ္စည်းအမျိုးမျိုးရောင်းဝယ်ရေး)</p>
        <p
          className="p-1 bg-white text-xs text-primary "
          style={{
            borderRadius: "40px",
          }}
        >
          Flash Mall ultra
        </p>
      </div>
      <div className="flex flex-row flex-1">
        <Aside
          sidebarData={GroupSideBarData}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
        <div
          className="flex flex-1 overflow-y-auto bg-backgroundColor p-2"
          style={{
            height: "calc(100vh - 42px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
const Text = styled.div`
  background-color: red;
`;

export default DashboardLayout;
