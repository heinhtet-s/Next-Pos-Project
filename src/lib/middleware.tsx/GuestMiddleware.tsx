import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import authOptions from "../authOptions";

export default async function GuestMiddleware({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getServerSession(authOptions)) as any;

  if (user?.user?.email) {
    redirect("/shop-owner/sell-product");
  }
  return <>{children}</>;
}
