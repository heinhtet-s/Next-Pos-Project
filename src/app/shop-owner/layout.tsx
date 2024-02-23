import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import AuthMiddleware from "@/lib/middleware.tsx/AuthMiddleware";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthMiddleware>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthMiddleware>
  );
};

export default layout;
