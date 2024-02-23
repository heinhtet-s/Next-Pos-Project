// pages/api/exportToExcel.js
import { writeFileSync } from "fs";
import { join } from "path";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/globalFunction";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Generate your Excel data here
    const data = [
      ["Name", "Email"],
      ["John Doe", "john@example.com"],
      ["Jane Smith", "jane@example.com"],
    ];

    // Create a workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Add data to the worksheet
    worksheet.addRows(data);
    const headers = new Headers();
    // Set response headers for file download
    headers.set(
      "Content-Disposition",
      "attachment; filename=exported-data.xlsx"
    );
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Write the Excel file to the response
    const excelBuffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(excelBuffer), {
      status: 200,
      statusText: "OK",
      headers,
    });
  } catch (e: any) {
    console.error("Error exporting to Excel:", e);
    return errorResponse(e?.message);
  }
}
