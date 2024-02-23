import React from "react";

const DashboardCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="p-4  bg-white rounded-lg w-full min-h-full"
      style={{ flex: "1 1 auto" }}
    >
      {children}
    </div>
  );
};

export default DashboardCard;
