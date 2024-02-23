import AuthMiddleware from "@/lib/middleware.tsx/AuthMiddleware";
import GuestMiddleware from "@/lib/middleware.tsx/GuestMiddleware";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default layout;
