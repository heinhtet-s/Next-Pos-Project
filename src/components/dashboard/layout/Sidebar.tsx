"use client";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Profile from "../../../assets/images/profile.jpeg";
import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { signOut, useSession } from "next-auth/react";
import { sidebarDataProps } from "@/dto/utils";

const Aside = ({
  sidebarData,
  openMenu = true,
  setOpenMenu,
}: {
  sidebarData: sidebarDataProps[];
  openMenu?: boolean;
  setOpenMenu: any;
}) => {
  const pathname = usePathname();

  const { data: session } = useSession() as any;

  const user = session?.user;

  const showSidebarList = (item: sidebarDataProps, index: number) => {
    return (
      <MenuItem
        className={`text-md rounded-lg overflow-hidden my-4 font-semibold   items-center justify-start  transition ${
          pathname.includes(item.pathName)
            ? "bg-primary text-white  "
            : "text-text "
        }      `}
        key={index}
        icon={
          pathname.includes(item.pathName) ? item.activeIcon : item.inAtiveIcon
        }
        component={
          <Link
            className="hover:bg-primary hover:text-white"
            onClick={() => setOpenMenu(false)}
            href={item.pathName}
          />
        }
      >
        {item.title}
      </MenuItem>
    );
  };

  return (
    <Sidebar
      rootStyles={{
        position: "absolute",
        left: openMenu ? "0%" : "-100%",
        top: "0",
        height: "100%",
        zIndex: "100",
        width: "220px",
        overflow: "auto",
        "& svg": {
          fontSize: "1.5rem",
        },
        "& ul": {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
        "& > div": {
          display: "flex",
          overflow: "visible !important",
          flexDirection: "column",
          // Use your custom Tailwind CSS class for background color
        },
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "@media (min-width: 768px)": {
          position: "relative",
          left: "0",

          padding: "10px",
        },
      }}
    >
      <div className="flex items-center bg-white py-2">
        <Image
          src={Profile}
          alt="logo"
          className="
         w-12
         mr-4
         h-12
       
         rounded-lg
         "
        />
        <p
          className="
        text-xs
        font-semibold 
        "
        >
          Flash Mall
        </p>
      </div>
      <Menu className="bg-white h-full  ">
        <div className="mb-auto text-3xl ">
          {sidebarData.map((item: any, index: any) =>
            showSidebarList(item, index)
          )}
        </div>

        <MenuItem
          className="rounded-lg text-text text-md  overflow-hidden mb-10 font-semibold   items-center justify-start text-lg"
          icon={<BiLogOut />}
        >
          <div className="flex items-center  ">
            <span>Log Out</span>
          </div>
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default Aside;
