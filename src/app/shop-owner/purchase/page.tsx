import { getServerSession } from "next-auth";
import React from "react";
import SellProductService from "../sell-product/body";
import authOptions from "@/lib/authOptions";

export default async function page() {
  const session = await getServerSession(authOptions);
  return <SellProductService session={session} />;
}
