import { HiHome, HiOutlineHome } from "react-icons/hi";
import { HiOutlineDocumentReport, HiDocumentReport } from "react-icons/hi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BsFillCartFill } from "react-icons/bs";
import { MdInventory, MdOutlineInventory2 } from "react-icons/Md";
import { AiOutlineSetting, AiFillSetting } from "react-icons/ai";
export const GroupSideBarData = [
  {
    title: "Home",
    pathName: "/home",
    activeIcon: <HiHome />,
    inAtiveIcon: <HiOutlineHome />,
  },
  {
    title: "Sell Products ",
    pathName: "/shop-owner/sell-product",
    activeIcon: <HiDocumentReport />,
    inAtiveIcon: <HiOutlineDocumentReport />,
  },
  {
    title: "Sell Report",
    pathName: "/shop-owner/sell-report",
    activeIcon: <BsFillCartFill />,
    inAtiveIcon: <AiOutlineShoppingCart />,
  },
  {
    title: "Inventory  Control",
    pathName: "/shop-owner/inventory-control/product",
    activeIcon: <MdInventory />,
    inAtiveIcon: <MdOutlineInventory2 />,
  },
  {
    title: "General Setting",
    pathName: "/shop-owner/dashboard/users",
    activeIcon: <AiFillSetting />,
    inAtiveIcon: <AiOutlineSetting />,
  },
];
