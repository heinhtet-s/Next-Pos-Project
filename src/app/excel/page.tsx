"use client";
import React from "react";

const ExportToExcel = () => {
  const handleExport = async () => {
    try {
      const response = await fetch("/api/excel");
      if (response.ok) {
        // Trigger file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported-data.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to export to Excel");
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return <button onClick={handleExport}>Export to Excel</button>;
};

export default ExportToExcel;

