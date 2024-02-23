"use client";
import BackBtn from "@/components/dashboard/BackBtn";
import DashboardCard from "@/components/ui/dashboardCard";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "flowbite-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { collection, onSnapshot } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import SellTable from "@/components/ui/SellTable";
const ExpenseForm = z.object({
  amount: z.string(),
  remark: z.string(),
  date: z.date(),
  category: z.string(),
});
const columns = [
  {
    header: "photo",
    accessor: "image",
  },
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Photo",
    accessor: "phone",
  },

  {
    header: "Phone",
    accessor: "phone",
  },
  {
    header: "message.deby",
    accessor: "debt",
  },
  {
    header: "action",
    accessor: "action",
  },
];

const page = () => {
  const form = useForm<z.infer<typeof ExpenseForm>>({
    resolver: zodResolver(ExpenseForm),
  });
  async function onSubmit(values: z.infer<typeof ExpenseForm>) {}
  const [customers, setCustomers] = useState<any>([]);
  const [imgUrl, setImgUrl] = useState<any>([]);
  const { data: session } = useSession() as any;
  const handleUploadImage = (e: any) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
      const file = files[i];
      setImgUrl((prev: any) => [...prev, file]);
    }
  };
  useEffect(() => {
    if (!session?.user?.shopId && !session?.user?.city) {
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, session?.user.city, session?.user?.shopId, "customer"),
      (snapshot) => {
        setCustomers(snapshot.docs.map((doc) => doc.data()));
      }
    );
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [session?.user?.shopId, session?.user?.city]);
  console.log(customers, "customer");
  const rows = customers?.map((customer: any) => ({
    ...customer,
    image: (
      <img
        src={
          customer?.image !== "default" && customer?.image !== ""
            ? customer?.image
            : "https://flashmallmm.com/img/2.f86d3108.png"
        }
        alt={customer?.name}
        className="w-10 h-10 object-cover rounded-lg"
      />
    ),
    action: (
      <div className="flex space-x-2">
        <button
          className="bg-green-500 w-fit w-24 text-white px-1 py-1 rounded-lg"
          // onClick={() => AddStockHandler(item)}
        >
          Add
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-lg"
          // onClick={() =>
          //   router.push(
          //     `/shop-owner/inventory-control/product/${item.id}/detail`
          //   )
          // }
        >
          Edit
        </button>
        <button className="bg-red-500 text-white px-3 py-1 rounded-lg">
          Delete
        </button>
      </div>
      // <Popover>
      //   <PopoverTrigger>
      //     <Button className="w-20">Action</Button>
      //   </PopoverTrigger>
      //   <PopoverContent>
      //     <div className="flex flex-col">
      //       <Button className="w-full">Edit</Button>
      //       <Button className="w-full">Delete</Button>
      //     </div>
      //   </PopoverContent>
      // </Popover>
    ),
  }));

  return (
    <div className="w-full">
      <BackBtn text="Expense" />
      <DashboardCard>
        <div className="grid grid-cols-3 gap-4 w-full ">
          <div className="col-span-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="ml-4 my-5">
                  <Label htmlFor="picture" className="mb-3">
                    Picture
                  </Label>
                  <Input
                    id="picture"
                    type="file"
                    multiple
                    onChange={handleUploadImage}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="ml-5 my-5">
                      {/* <FormLabel>Amount</FormLabel> */}
                      <div className="flex ">
                        <FormControl className="flex">
                          <Input
                            className="h-14"
                            placeholder="Amount"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem className="ml-5 my-5">
                      <div className="flex ">
                        <FormControl className="flex">
                          <Input
                            className="h-14"
                            placeholder="Remark"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="ml-5 my-5">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* {expenseCategories.map((brand: any) => (
                            <SelectItem value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))} */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full py-2">
                  Add Expense
                </Button>
              </form>
            </Form>
          </div>
          <div className="col-span-2">
            <SellTable columns={columns} data={rows} />
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default page;
