import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define a generic type for the data prop
type SellTableProps<T extends Record<string, any>> = {
  columns: {
    header: string;
    accessor: string;
  }[];
  data: T[];
};

const SellTable = <T extends Record<string, any>>({
  columns,
  data,
}: SellTableProps<T>) => {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          {columns.map((column, index: number) => (
            <TableHead key={index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: T, index: number) => (
          <TableRow key={index}>
            {columns.map((column, index: number) => (
              <TableCell key={index} className="font-medium">
                {item[column.accessor]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SellTable;
