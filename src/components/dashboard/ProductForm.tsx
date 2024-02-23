"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DashboardCard from "@/components/ui/dashboardCard";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Label } from "flowbite-react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import {
  TodayDateTime,
  formatDate,
  getDay,
  getMonth,
  getYear,
} from "@/lib/helper";
import { useParams, useRouter } from "next/navigation";
import { AiOutlineBarcode } from "react-icons/ai";
import { useQueryClient } from "react-query";
import { Calendar } from "../ui/Calendar";
import { Textarea } from "../ui/textarea";

const ProductFormSchema = z.object({
  barcode: z.string().min(1, { message: "Please Enter Barcode" }),
  itemName: z.string().min(1, { message: "Please Enter Item Name" }),
  buyPrice: z.string().min(1, { message: "Please Enter Buy Price" }),
  sellPrice: z.string().min(1, { message: "Please Enter Sell Price" }),
  stock: z.string(),
  type: z.string(),
  color: z.string(),
  brand: z.string(),
  weight: z.string(),
  size: z.string(),
  expireDate: z.date().nullable(),
  youtubeLink: z.string(),
  description: z.string(),
});
type categoryProps = {
  url: string;
  name: string;
  id: string;
};

function ProductForm({ productData }: { productData?: any }) {
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      barcode: productData?.barcode ? productData?.barcode : "",
      itemName: productData?.itemName ? productData?.itemName : "",
      buyPrice: productData?.buyPrice ? productData?.buyPrice : "0",
      sellPrice: productData?.sellPrice ? productData?.sellPrice : "0",
      stock: productData?.stock ? productData?.stock : "",
      type: productData?.type ? productData?.type : "",
      color: productData?.color ? productData?.color : "",
      brand: productData?.brand ? productData?.brand : "",
      weight: productData?.weight ? productData?.weight : "",
      size: productData?.size ? productData?.size : "",
      youtubeLink: productData?.youtubeLink ? productData?.youtubeLink : "",
      description: productData?.description ? productData?.description : "",
      expireDate: productData?.expireDate
        ? new Date(productData?.expireDate)
        : null,
    },
  });
  const { id: editId } = useParams() as {
    id: string;
  };
  const { data: session } = useSession() as any;
  const [productTypes, setProductTypes] = useState<categoryProps[]>([]);
  const [brands, setBrands] = useState<categoryProps[]>([]);
  const [sizes, setSizes] = useState<categoryProps[]>([]);
  const [colors, setColors] = useState<categoryProps[]>([]);
  const [weights, setWeights] = useState<categoryProps[]>([]);
  const [ImgUrl, setImgUrl] = useState<any>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session) return;
    const city = session?.user?.city;
    const shopId = session?.user?.shopId;
    const categoryRef = collection(db, city, shopId, "category");
    const brandRef = collection(db, city, shopId, "brand");
    const sizeRef = collection(db, city, shopId, "size");
    const colorRef = collection(db, city, shopId, "color");
    const weightRef = collection(db, city, shopId, "weight");

    const unsubscribe = onSnapshot(categoryRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      setProductTypes(types);
    });
    const unsubscribe1 = onSnapshot(brandRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      setBrands(types);
    });
    const unsubscribe2 = onSnapshot(sizeRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      setSizes(types);
    });
    const unsubscribe3 = onSnapshot(colorRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      setColors(types);
    });
    const unsubscribe4 = onSnapshot(weightRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      setWeights(types);
    });

    // const unsubscribe = onSnapshot(categoryRef, (snapshot) => {
    //   const types: any = [];
    //   snapshot.forEach((doc) => {
    //     types.push(doc.data());

    return () => {
      unsubscribe();
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [session]);
  async function onSubmit(values: z.infer<typeof ProductFormSchema>) {
    try {
      const images = await uploadImage();
      let productRef: any;
      let productId = "";
      if (!productData) {
        productRef = doc(
          collection(db, session?.user?.city, session?.user?.shopId, "products")
        );
        productId = productRef.id;
      } else {
        console.log("editId");
        productRef = doc(
          db,
          session?.user?.city,
          session?.user?.shopId,
          "products",
          editId
        );
      }
      const submitData = {
        ...values,
        id: editId ? editId : productRef.id,
        itemCode: session?.user?.shopCode + getRandomStr(),
        expireDate: values?.expireDate ? formatDate(values?.expireDate) : "",
        day: getDay(),
        month: getMonth(),
        dateTime: TodayDateTime(),
        year: getYear(),
        time: Timestamp.now(),
        images,

        note: "default",
        process: "add",
        count: values.stock ? values.stock.toString() : "0",
        buyPrice: values.buyPrice !== "" ? values.buyPrice.toString() : "0",
        sellPrice: values.sellPrice !== "" ? values.sellPrice.toString() : "0",
        youtubeLink: values.youtubeLink
          ? values.youtubeLink.split("be/")[1]
          : "",
        rating: "",
        discount: "",
      };

      // if (productData) {
      //   await setDoc(productRef, submitData);
      //   await addRecord(submitData);
      //   return;
      // }
      // console.log("hello");
      console.log(productRef);
      await setDoc(productRef, submitData);
      const recordRef = collection(productRef, "records");
      await addDoc(recordRef, {
        id: submitData.id,
        recordId: recordRef.id,
        itemCode: submitData.itemCode,
        barcode: submitData.barcode,
        itemName: submitData.itemName,
        buyPrice: submitData.buyPrice,
        sellPrice: submitData.sellPrice,
        stock: submitData.stock.toString(),
        description: submitData.description,
        type: submitData.type,
        color: submitData.color,
        size: submitData.size,
        weight: submitData.weight,
        time: submitData.time,
        day: submitData.day,
        month: submitData.month,
        dateTime: submitData.dateTime,
        year: submitData.year,
        rating: "",
        discount: "",
        note: "default",
        process: "add",
        count: submitData.count,
      });
      queryClient.invalidateQueries(["products", ""]);
      router.back();
    } catch (error) {
      console.log(error);
      toast.error("Error in adding product");
    }
  }
  const uploadImage = async () => {
    const images: string[] = [];
    if (ImgUrl.length > 0) {
      const productRef = doc(
        collection(db, session?.user?.city, session?.user?.shopId, "products")
      );
      const storage = getStorage();

      for (let index = 0; index < ImgUrl.length; index++) {
        const img = ImgUrl[index];
        const imgRef = ref(
          storage,
          `/${session?.user?.city}/${session?.user?.shopId}/products/${
            productRef.id
          }/${index + productRef.id}`
        );

        try {
          const snapshot = await uploadBytes(imgRef, img);

          // Get the download URL after the upload is complete
          const img_src = await getDownloadURL(imgRef);

          images.push(img_src);
        } catch (error) {
          toast.error("Error in uploading image");
        }
      }
    }
    return images;
  };
  const getRandomStr = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  const generateBarcode = (e: any) => {
    e.preventDefault();
    console.log("generateBarcode", session.user.shopCode + getRandomStr());
    form.setValue("barcode", session.user.shopCode + getRandomStr(), {
      shouldValidate: true,
    });
  };
  const handleUploadImage = (e: any) => {
    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
      const file = files[i];
      setImgUrl((prev: any) => [...prev, file]);
    }
  };
  const addRecord = async (data: any) => {
    const timestamp = new Date();
    const currentDay = timestamp.getDate();
    const currentMonth = timestamp.getMonth() + 1;
    const currentYear = timestamp.getFullYear();
    const currentDateTime = timestamp.toISOString();

    const {
      id,
      itemCode,
      barcode,
      itemName,
      buyPrice,
      sellPrice,
      stock,
      description,
      type,
      color,
      size,
      weight,
      expireDate,
      youtubeLink,
      rating,
      discount,
    } = data;
    const originalStock = productData?.stock;
    const originalBuyPrice = productData?.buyPrice;
    const originalSellPrice = sellPrice?.sellPrice;

    const recordsRef = collection(
      db,
      session?.user?.city,
      session?.user?.shopId,
      "products",
      editId,
      "records"
    );

    const addRecordToFirestore = async (
      process: string,
      note: string,
      count: string | number
    ) => {
      const recordRef = await addDoc(recordsRef, {
        id,
        itemCode,
        barcode,
        itemName,
        buyPrice,
        sellPrice,
        stock: stock.toString(),
        description,
        type,
        color,
        size: size.toString(),
        weight: weight.toString(),
        time: timestamp,
        day: currentDay,
        month: currentMonth,
        year: currentYear,
        expireDate,
        youtubeLink,
        dateTime: currentDateTime,
        rating,
        discount,
        note,
        process,
        count: count.toString(),
      });

      return recordRef;
    };

    try {
      // Add the record for the info update
      const infoRecordRef = await addRecordToFirestore(
        "infoUpdate",
        "default",
        "0"
      );
      console.log("Original Stock:", originalStock);
      console.log("Update Stock:", stock);

      if (originalStock !== stock) {
        let newStock;
        if (stock !== "") {
          if (originalStock === "") {
            newStock = parseInt(stock);
          } else {
            newStock = parseInt(stock) - parseInt(originalStock);
          }
        } else {
          newStock = "";
        }

        // Add the record for stock update
        await addRecordToFirestore("stockUpdate", "default", newStock);
      }

      if (originalBuyPrice !== buyPrice) {
        // Add the record for buy price change
        await addRecordToFirestore(
          "buyPrice",
          `Buy price - change (${originalBuyPrice} -> ${buyPrice})`,
          "0"
        );
      }

      if (originalSellPrice !== sellPrice) {
        // Add the record for sell price change
        await addRecordToFirestore(
          "sellPrice",
          `Sell price - change (${originalSellPrice} -> ${sellPrice})`,
          "0"
        );
      }

      // Reset loading and navigate back
      toast.success("Product updated successfully");
      router.back();
    } catch (error) {
      console.error("Error adding record:", error);
      // Handle the error as needed
    }
  };

  return (
    <DashboardCard>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>BarCode</FormLabel>
                      <div className="flex ">
                        <FormControl className="flex">
                          <Input className="h-14" placeholder="" {...field} />
                        </FormControl>
                        <Button onClick={generateBarcode}>
                          <AiOutlineBarcode className="text-xl" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Buy Price</FormLabel>
                      <FormControl>
                        <Input className="h-14" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Stock (optional)</FormLabel>
                      <FormControl>
                        <Input className="h-14" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Size</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem value={size.name}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="h-14" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid w-full max-w-sm items-center gap-1.5 ">
                  <Label htmlFor="picture">Picture</Label>
                  <Input
                    id="picture"
                    type="file"
                    multiple
                    onChange={handleUploadImage}
                  />
                </div>
              </div>
              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>itemName</FormLabel>
                      <FormControl>
                        <Input className="h-14" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Sell Price</FormLabel>
                      <FormControl>
                        <Input className="h-14" placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem value={color.name}>
                              {color.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expireDate"
                  render={({ field }) => (
                    <FormItem className="my-5">
                      <FormLabel>expire Date</FormLabel>
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
                                <span>Pick a date</span>
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
              </div>
            </div>

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
                      className="w-40 h-fit "
                    />
                  ))}
                </div>
              </div>
            )}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </DashboardCard>
  );
}

export default ProductForm;
