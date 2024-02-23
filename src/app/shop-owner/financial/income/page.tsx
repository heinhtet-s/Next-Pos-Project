"use client";
import BackBtn from "@/components/dashboard/BackBtn";
import DashboardCard from "@/components/ui/dashboardCard";
import {
  and,
  getCountFromServer,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "flowbite-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FaGreaterThan } from "react-icons/fa";
import { db } from "@/lib/firebase";
import CategoryComponent from "@/components/dashboard/CategoryComponent";
import { AiFillPlusCircle } from "react-icons/ai";
import { formatDate, formatMonth } from "@/lib/helper";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
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
import { Calendar } from "@/components/ui/Calendar";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { collection, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";
const ExpenseForm = z.object({
  amount: z.string(),
  remark: z.string(),
  date: z.date(),
  category: z.string(),
});
const page = () => {
  const [expenseCategories, setExpenseCategories] = useState<any>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("All");
  const { data: session } = useSession() as any;
  const [expenses, setExpenses] = useState([]);
  const [filterExpenses, setFilterExpenses] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [ImgUrl, setImgUrl] = useState<any>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [infoModalActive, setInfoModalActive] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  console.log(activeCategoryId, "activeCategoryId");
  useEffect(() => {
    const getExpense = async () => {
      if (!session?.user?.city || !session?.user?.shopId) {
        return;
      }
      const expensesRef = collection(
        db,
        session?.user?.city,
        session?.user?.shopId,
        "incomes"
      );
      const expensesQuery = query(
        expensesRef,
        where("month", "==", formatMonth(selectedMonthDate)),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
        const newExpenses: any = [];
        const newFilterExpenses: any = [];
        let newTotalPrice = 0;

        snapshot.forEach((doc) => {
          if (activeCategoryId !== "All") {
            if (doc.data().categoryName === activeCategoryId) {
              newExpenses.push(doc.data());
            }
          } else {
            newExpenses.push(doc.data());
          }
        });

        newExpenses.forEach((exp: any) => {
          newTotalPrice += parseInt(exp.amount, 10);
        });

        setExpenses(newExpenses);
        setFilterExpenses(newFilterExpenses);
        setTotalPrice(newTotalPrice);
      });

      // Cleanup the subscription when the component unmounts
      return () => unsubscribe();
    };

    getExpense();
  }, [
    db,
    session?.user?.city,
    session?.user?.shopId,
    selectedMonthDate,
    activeCategoryId,
  ]); // Include any dependencies from the component's state or props
  const form = useForm<z.infer<typeof ExpenseForm>>({
    resolver: zodResolver(ExpenseForm),
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.city || !session?.user?.shopId) {
        console.log(session?.user?.city, session?.user?.shopId);
        return;
      }
      console.log(" city or shop id");
      const CategoryCollectionRef = collection(
        db,
        session?.user?.city,
        session?.user?.shopId,
        "incomeCategory"
      );
      const sortedQuery = query(CategoryCollectionRef);

      const unsubscribe = onSnapshot(sortedQuery, (snapshot) => {
        const categories: any = [];
        snapshot.forEach((doc) => {
          if (doc.data().name !== "All") {
            categories.push(doc.data());
          }
        });

        setExpenseCategories(categories);
      });

      // Cleanup the subscription when the component unmounts
      return () => unsubscribe();
    };

    fetchData();
  }, [db, session?.user?.city, session?.user?.shopId]);

  console.log(expenseCategories);
  const handleUploadImage = (e: any) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
      const file = files[i];
      setImgUrl((prev: any) => [...prev, file]);
    }
  };
  async function onSubmit(values: z.infer<typeof ExpenseForm>) {
    const expense: any = {};
    if (!values.amount || !values.remark || !values.date || !values.category) {
      toast.error("Please fill all fields");
      return;
    }

    const expenseRef = collection(
      db,
      session.user.city,
      session.user.shopId,
      "expenses"
    );
    expense.createdAt = serverTimestamp();
    expense.month = formatMonth(new Date());
    expense.id = expenseRef.id;
    expense.date = formatDate(values.date);
    expense.categoryName = expenseCategories.filter(
      (el: any) => el.id === values.category
    )[0]?.name;
    expense.categoryId = expenseCategories.filter(
      (el: any) => el.id === values.category
    )[0]?.id;
    console.log(expense, "expeeee1233nse");
    if (ImgUrl.length > 0) {
      setLoadingActive(true);
      const storage = getStorage();

      const imgRef = ref(
        storage,
        `/${session.user.city}/${session.user.shopId}/expenses/${expense.id}`
      );

      try {
        await uploadBytes(imgRef, ImgUrl[0]);
        const imgSrc = await getDownloadURL(imgRef);
        expense.image = imgSrc;
        console.log(expense, "expense");
        await addDoc(expenseRef, expense);
      } catch (error) {
        console.error(error);
      } finally {
        queryClient.invalidateQueries("expenses");
        form.reset();
        setImgUrl([]);
        setLoadingActive(false);
      }
    } else {
      setLoadingActive(false);
      expense.image = [];
      console.log(expense, "expense");
      await addDoc(expenseRef, expense);
    }
  }

  return (
    <div className="w-full">
      <BackBtn text="Expense" />
      <DashboardCard>
        <div className="grid grid-cols-3 gap-4 w-full ">
          <div className="col-span-1">
            <div>
              <h1 className="text-xl font-semibold">Add Expense</h1>
              {ImgUrl.length > 0 && (
                <div className=" bg-blue-200 p-3  rounded-md mb-3">
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setImgUrl([]);
                      }}
                    >
                      clear
                    </Button>
                  </div>
                  <div className="flex w-full space-x-2 flex-wrap  ">
                    {ImgUrl.map((img: any) => (
                      <img
                        src={URL.createObjectURL(img)}
                        alt=""
                        className="w-20 h-fit "
                      />
                    ))}
                  </div>
                </div>
              )}
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
                    name="date"
                    render={({ field }) => (
                      <FormItem className="ml-3 my-5">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full flex justify-center items-center h-14  pl-3  text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field?.value, "PPP")
                                ) : (
                                  <span>Date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field?.value as any}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

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
                            {expenseCategories.map((brand: any) => (
                              <SelectItem value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
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
          </div>
          <div className="col-span-2">
            <div className="flex justify-between items-center">
              <div>
                <p>Total Expenses</p>
                <p>{totalPrice} Ks</p>
              </div>
              <div>
                <CustomDatePicker
                  selectedDate={selectedMonthDate}
                  handleDateChange={(date: Date) => {
                    setSelectedMonthDate(date);
                  }}
                  dateType="month"
                />
              </div>
            </div>

            <div className="flex items-center bg-backgroundColor p-3 mt-5 rounded-lg ">
              <div className="flex items-center overflow-x-auto   ">
                <CategoryComponent
                  category={{
                    id: "0",
                    name: "All",
                  }}
                  activeCategory={activeCategoryId}
                  setActiveCategory={setActiveCategoryId}
                />

                {expenseCategories.map((item: any) => (
                  <CategoryComponent
                    category={item}
                    activeCategory={activeCategoryId}
                    setActiveCategory={setActiveCategoryId}
                  />
                ))}
              </div>
            </div>
            <div className=" bg-backgroundColor p-3 mt-5 rounded-lg ">
              {expenses.map((item: any, index: number) => (
                <div key={index} className=" bg-white p-3 my-2 rounded-lg ">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <button className="flex items-center px-2 py-1 bg-primary rounded-lg text-white">
                        {item?.categoryName}
                      </button>
                    </div>
                    <p className="text-md font-semibold">{item?.date}</p>
                  </div>
                  <div className="flex justify-between items-center mt-5">
                    <div className="flex items-center">
                      <p className="text-md font-semibold">{item?.remark}</p>
                      <p className="text-md font-semibold ml-2">
                        {item?.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default page;
