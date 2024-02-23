import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import React from "react";
import authOptions from "../authOptions";
import { useSession } from "next-auth/react";

export default async function AuthMiddleware({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession(authOptions);
  console.log(user);
  if (!user?.user?.email) {
    redirect("/login");
  }
  return <>{children}</>;
}
