import React from "react";
import SellProductService from "./body";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

export default async function page() {
  const session = await getServerSession(authOptions);
  return <SellProductService session={session} />;
}
