"use client";
import DashboardCard from "@/components/ui/dashboardCard";
import React, { useEffect, useRef, useState } from "react";
import { Label, Select, TextInput, Button, Textarea } from "flowbite-react";
import ProductImg from "@/assets/images/product.png";
import { IoIosArrowBack } from "react-icons/io";
import { AiFillMinusCircle } from "react-icons/ai";
import { AiTwotonePhone } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";

import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ClearCart,
  ProductItemType,
  ProductState,
} from "@/lib/store/productSlice";
import { RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { CartNumber } from "@/dto/utils";
import {
  ExportPhothHandler,
  TodayDate,
  TodayDateTime,
  getDay,
  getMonth,
  getYear,
} from "@/lib/helper";
import { IoSaveSharp } from "react-icons/io5";
import { BiSolidPrinter } from "react-icons/bi";
import { ImCross } from "react-icons/im";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import BackBtn from "@/components/dashboard/BackBtn";
import {
  collection,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChangeEventTypes } from "@/dto/form";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { postData } from "@/lib/apiService";
import { useMutation, useQueryClient } from "react-query";
import { SellNow } from "@/lib/SellProduct";

type paymentDataType = {
  paymentType: string;
  type: string;
  payAmount: number;
  note: string;
  discountType: string;
  discountPrice: number;
};

const page = () => {
  const [customer, setCustomer] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>();
  const [selectedCustomer, setSelectedCustomer] = useState<any>();
  const addToCartData: ProductState = useSelector(
    (state: RootState) => state.productReducer
  );
  const { data: session } = useSession() as any;
  const [sellItem, setSellItem] = useState<any[]>([]);
  const searchQuery = useSearchParams();
  const cartNumber = (searchQuery.get("cartNumber") || "one") as CartNumber;
  const payAmount = addToCartData[cartNumber]?.reduce(
    (acc: number, item: ProductItemType) => {
      return acc + item.cost;
    },
    0
  );
  const payAmountwithTax: number =
    payAmount + +(payAmount * (+session?.user?.tax / 100)).toFixed(0);
  const paymentInitalData = {
    paymentType: "Cash",
    type: "cash",
    payAmount: payAmountwithTax,
    note: "",
    discountType: "byPrice",
    discountPrice: 0,
  };
  const [paymentData, setPaymentData] =
    useState<paymentDataType>(paymentInitalData);

  const VouncherRef = useRef<HTMLDivElement>(null);
  const [voucherId, setVoucherId] = useState<string>("");
  const router = useRouter();
  const total = addToCartData[cartNumber]?.reduce(
    (acc: number, item: ProductItemType) => {
      return acc + item.cost;
    },
    0
  );
  const handlePaymentChange = (e: ChangeEventTypes) => {
    const { name, value } = e.target;
    if (value === "byRate") {
      if (paymentData.discountPrice > 100 || paymentData.discountPrice < 0) {
        toast.error("Discount rate must be between 0 and 100");
        return;
      }
    } else {
      if (paymentData.discountPrice > total) {
        toast.error("Discount price must be less than total price");
        return;
      }
    }

    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };
  const handlePrint = useReactToPrint({
    content: () => VouncherRef.current,
    onAfterPrint: () => {
      // Reset the Promise resolve so we can print again
      console.log("done");
    },
  });

  const handleSubmitPrint = useReactToPrint({
    content: () => VouncherRef.current,
    onAfterPrint: () => {
      toast.success("Successfully sold");
      router.push("/shop-owner/sell-product");
    },
  });
  console.log(session);
  useEffect(() => {
    if (!session) return;

    const sellItemQuery = query(
      collection(db, session.user.city, session.user.shopId, "sellProducts"),
      where("day", "==", TodayDate()),
      where("casherCode", "==", session.user.accountCode)
    );

    const unsubscribe = onSnapshot(sellItemQuery, (snap) => {
      let sellItems: any[] = [];
      snap.forEach((doc) => {
        sellItems.push(doc.data());
      });
      setSellItem(sellItems);
      setVoucherId(generateVoucherId(sellItems.length + 1));
    });

    return () => {
      unsubscribe();
    };
  }, [session]);
  const generateVoucherId = (padNumber: number) => {
    const date = new Date();
    let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
    let twoDigitMonth = new Intl.DateTimeFormat("en", {
      month: "2-digit",
    }).format(date);
    let twoDigitYear = date.getFullYear().toString().slice(-2);
    let vId = "";
    //TODO: must be used owner selected casherCode
    vId =
      session?.user?.shopCode +
      session?.user?.accountCode +
      twoDigitYear +
      twoDigitMonth +
      day +
      padNumber.toString().padStart(5, "0");
    return vId;
  };
  useEffect(() => {
    if (!session) return;
    const city = session?.user?.city;
    const shopId = session?.user?.shopId;
    const paymentRef = collection(db, city, shopId, "paymentMethods");
    const customerRef = collection(db, city, shopId, "customer");
    console.log("fgggg");
    const unsubscribe = onSnapshot(paymentRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      console.log("payment", types);
      setPaymentMethods(types);
    });
    const unsubscribeCustomer = onSnapshot(customerRef, (snapshot) => {
      const types: any = [];
      snapshot.forEach((doc) => {
        types.push(doc.data());
      });
      console.log("customer", types);
      setCustomer(types);
    });
    return () => {
      unsubscribe();
      unsubscribeCustomer();
    };
  }, [session]);
  const resetPaymentData = () => {
    setPaymentData(paymentInitalData);
  };

  const getDiscountPrice = () => {
    if (paymentData.discountType === "byPrice") {
      return paymentData.discountPrice;
    } else {
      return +(total * (paymentData.discountPrice / 100)).toFixed(0);
    }
  };
  const getNetAmount = () => {
    let tax = (total * (+session?.user?.tax / 100)).toFixed(0);
    let discount = getDiscountPrice();

    let netAmount = total - discount + +tax;
    return netAmount;
  };
  const getCharge = () => {
    let netAmount = getNetAmount();
    return +paymentData.payAmount - +netAmount;
  };
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const handleSubmitSale = async () => {
    setLoading(true);
    let tax = (total * (+session?.user?.tax / 100)).toFixed(0);
    const selectedProduct = addToCartData[cartNumber];
    const product = {
      day: getDay(),
      month: getMonth(),
      year: getYear(),
      dateTime: TodayDateTime(),
      customerId: selectedCustomer?.id || "",
      customerName: selectedCustomer?.name || "",
      customerPhone: selectedCustomer?.phone || "",
      customerAddress: selectedCustomer?.address || "",
      customerTotalPrice: "",
      buyPriceList: selectedProduct?.map((item) => item?.buyPrice.toString()),
      sellPriceList: selectedProduct?.map((item) => item?.price.toString()),
      countList: selectedProduct?.map((item) => item?.qty.toString()),
      itemCodeList: selectedProduct?.map((item) => item?.id.toString()),
      productIdList: selectedProduct?.map((item) => item?.id.toString()),
      productUnitList: selectedProduct?.map((item) => item?.unit.toString()),
      nameList: selectedProduct?.map((item) => item?.name.toString()),
      paymentMethod: paymentData.paymentType,
      totalPrice: getNetAmount(),
      paymentId: paymentMethods.find(
        (el: any) => el?.paymentType === paymentData.paymentType
      )?.id,
      casherCode: session?.user?.accountCode,
      change: getCharge() ? getCharge().toString() : "0",
      credit: getNetAmount() - paymentData.payAmount,
      discount: getDiscountPrice() ? getDiscountPrice().toString() : "0",
      tax: tax ? tax.toString() : "0",
      vouncherId: voucherId,
      cashReceived: paymentData.payAmount.toString(),
      sellType: "offlineSell",
    };

    const data2 = await SellNow(product, session);
    setLoading(false);
    if (data2.success) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      dispatch(ClearCart(cartNumber));
      handleSubmitPrint();
    } else {
      toast.error("Something went wrong please try again");
    }
  };

  return (
    <div
      className="w-full min-h-full flex flex-col items-start
     "
    >
      <div className="flex justify-between w-full">
        <BackBtn text="Sale Setup" />
        <div className="flex items-center space-x-5">
          <button
            className="text-lg font-normal hover:scale-110 transition my-3"
            onClick={() => ExportPhothHandler(VouncherRef.current)}
          >
            <IoSaveSharp className="inline-block" />
          </button>
          <button
            onClick={handlePrint}
            className="text-lg font-normal hover:scale-110 transition my-3"
          >
            <BiSolidPrinter className="inline-block" />
          </button>
          <button
            onClick={() => {
              router.push("/shop-owner/sell-product");
            }}
            className="text-lg font-normal hover:scale-110 transition my-3"
          >
            <ImCross className="inline-block" />
          </button>
        </div>
      </div>
      <div
        className="grid grid-cols-3 gap-2  "
        style={{
          flex: "1 1 auto",
        }}
      >
        <PaymentSection
          handlePaymentChange={handlePaymentChange}
          resetPaymentData={resetPaymentData}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
        />
        <CustomerSection
          customer={customer}
          setSelectedCustomer={setSelectedCustomer}
          selectedCustomer={selectedCustomer}
        />
        <VoucherSection
          getCharge={getCharge}
          data={addToCartData[cartNumber]}
          paymentData={paymentData}
          VouncherRef={VouncherRef}
          voucherId={voucherId}
          getDiscountPrice={getDiscountPrice}
          getNetAmount={getNetAmount}
        />
      </div>
      <div
        className="
      flex justify-end   w-full
      "
      >
        <Button
          className="w-96 mt-5 "
          disabled={loading}
          onClick={handleSubmitSale}
        >
          {loading ? "Loading..." : "Sale Now"}
        </Button>
      </div>
    </div>
  );
};
const PaymentSection = ({
  paymentData,
  setPaymentData,
  paymentMethods,
  setPaymentMethods,
  resetPaymentData,
  handlePaymentChange,
}: {
  paymentData: paymentDataType;
  setPaymentData: React.Dispatch<React.SetStateAction<paymentDataType>>;
  paymentMethods: any;
  setPaymentMethods: React.Dispatch<any>;
  resetPaymentData: () => void;
  handlePaymentChange: (e: ChangeEventTypes) => void;
}) => {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 170px)" }}>
      <DashboardCard>
        <div className="mb-10">
          <div className=" my-2" id="select">
            <div className="mb-2  flex justify-between">
              <Label htmlFor="countries" value="Discount (optional)" />
              <button className="bg-backgroundColor p-1 text-yellow-500 rounded-lg">
                Reset
              </button>
            </div>
            <Select
              id="countries"
              className="w-full"
              name="discountType"
              value={paymentData.discountType}
              onChange={(e: ChangeEventTypes) => {
                setPaymentData({
                  ...paymentData,
                  discountPrice: 0,
                  discountType: e.target.value,
                });
              }}
            >
              <option value="byPrice">By Price</option>
              <option value="byRate">By Rate</option>
            </Select>
          </div>
          <div>
            <TextInput
              value={paymentData.discountPrice}
              name="discountPrice"
              onChange={handlePaymentChange}
              id="base"
              sizing="md"
              placeholder="enter amount"
              type="number"
            />
          </div>
          {/* <Button color="gray" size="xs" className="ms-auto my-2">
            Add
          </Button> */}
        </div>
        <div>
          <div className=" my-2" id="select">
            <div className="mb-2 block flex justify-between">
              <Label htmlFor="countries" value="Pay Account" />
              <button
                className="bg-backgroundColor p-1 text-yellow-500 rounded-lg"
                onClick={resetPaymentData}
              >
                Reset
              </button>
            </div>
            <Select
              id="countries"
              required
              value={paymentData.paymentType}
              onChange={(e: ChangeEventTypes) => {
                setPaymentData({
                  ...paymentData,
                  paymentType: e.target.value,
                });
              }}
            >
              {paymentMethods?.map((item: any, index: number) => (
                <option key={index} value={item.paymentType}>
                  {`${item.paymentType} (${item.accountName})\n${item.accountNumber}`}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email1" value="Pay Amount" />
            </div>
            <TextInput
              value={paymentData.payAmount}
              onChange={(e: ChangeEventTypes) => {
                setPaymentData({
                  ...paymentData,
                  payAmount: +e.target.value,
                });
              }}
              id="base"
              sizing="md"
              placeholder="enter amount"
              type="text"
            />
          </div>
          <div className="mb-2 block">
            <Label htmlFor="comment" value="Your message" />
          </div>
          <Textarea
            value={paymentData.note}
            onChange={(e: ChangeEventTypes) => {
              setPaymentData({
                ...paymentData,
                note: e.target.value,
              });
            }}
            className="p-3"
            id="comment"
            placeholder="External note  (optional)"
            required
            rows={3}
          />
        </div>
      </DashboardCard>
    </div>
  );
};
const CustomerSection = ({
  customer,
  setSelectedCustomer,
  selectedCustomer,
}: {
  customer: any;
  setSelectedCustomer: React.Dispatch<any>;
  selectedCustomer: any;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "calc(100vh - 170px)",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <DashboardCard>
        <div className="flex justify-between items-center">
          <Button color="gray" size="sm" className="my-2">
            Add
          </Button>
          <p className="text-xl font-normal">Customers</p>
          <Button color="red" size="sm" className="my-2">
            <AiFillMinusCircle className="inline-block " />
          </Button>
        </div>
        {customer?.map((el: any) => {
          return (
            <div
              onClick={() => {
                setSelectedCustomer(el);
              }}
              className={cn(
                "flex space-x-3 w-full my-2 p-2 cursor-pointer border-2 hover:bg-hover  rounded-md ",
                selectedCustomer?.id === el?.id
                  ? " bg-hover"
                  : "bg-backgroundColor"
              )}
            >
              <Image src={ProductImg} alt="customer" width={50} height={50} />
              <div>
                <p className="">
                  <BsFillPersonFill
                    className="
                inline-block mr-2
                "
                  />
                  <span>{el?.name}</span>
                </p>
                <p>
                  <AiTwotonePhone
                    className="
                inline-block mr-2
                "
                  />{" "}
                  <span> {el?.phone}</span>
                </p>
              </div>
            </div>
          );
        })}
      </DashboardCard>
    </div>
  );
};
const VoucherSection = ({
  data,
  VouncherRef,
  voucherId,
  getDiscountPrice,
  getNetAmount,
  paymentData,
  getCharge,
}: {
  data: ProductItemType[];
  VouncherRef: React.Ref<HTMLDivElement>;
  voucherId: string;
  getDiscountPrice: () => number;
  getNetAmount: () => number;
  paymentData: paymentDataType;
  getCharge: () => number;
}) => {
  const { data: session } = useSession() as any;

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "calc(100vh - 170px)",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
      }}
      className="no-scrollbar"
      ref={VouncherRef}
    >
      <div
        className="p-4  bg-white rounded-lg w-full min-h-full"
        style={{ flex: "1 1 auto" }}
        ref={VouncherRef}
      >
        <div className=" text-[12px]  font-[700]  bg-white p-[16px] rounded-md w-full">
          <div className="border-b-2 border-black text-center pb-2">
            <h1 className="font-bold  text-[1.25rem]">{session?.user?.name}</h1>
            <p className=" my-2">{session?.user?.address}</p>
            <p className="">
              <AiTwotonePhone className="inline-block mr-2" />
              {session?.user?.phone}
            </p>
          </div>
          <p className="my-1">Voucher No {voucherId}</p>
          <p className="my-1">{"Date: " + TodayDateTime()}</p>
          <table
            className=" w-full "
            style={{
              captionSide: "bottom",
              textIndent: "initial",
              borderSpacing: "2px",
              padding: "0px",
            }}
          >
            <thead>
              <tr
                className="[&>th]:p-[8px] "
                style={{
                  borderBottom: "2px dotted black !important",
                  borderRight: "0 !important",
                  borderLeft: "0 !important",
                  borderTop: "0 !important",
                }}
              >
                <th className="text-start">Items</th>
                <th className="text-start">Qty</th>
                <th className="text-start">Price</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item: ProductItemType, index: number) => (
                <tr className="[&>td]:p-[8px] mb-1  " key={index}>
                  <td>{item?.name}</td>
                  <td>{item?.qty}</td>
                  <td>{item?.price}</td>
                  <td className="text-end">{item?.cost}</td>
                </tr>
              ))}
              {/* {[...Array(5)].map((item, index) => (
                <tr className="[&>td]:p-[8px] mb-1  ">
                  <td>ကျောင်းဆရာ</td>
                  <td>1</td>
                  <td>100</td>
                  <td className="text-end">100</td>
                </tr>
              ))} */}
            </tbody>
          </table>
          <div>
            <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
              <p> Total</p>
              <p>
                {data?.reduce((acc: number, item: ProductItemType) => {
                  return acc + item.cost;
                }, 0)}
              </p>
            </div>
            {paymentData?.discountPrice > 0 && (
              <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
                <p> Discount</p>
                <p>{getDiscountPrice()}</p>
              </div>
            )}
            {+session?.user?.tax > 0 && (
              <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
                <p> Tax</p>
                <p>
                  {(
                    data?.reduce((acc: number, item: ProductItemType) => {
                      return acc + item.cost;
                    }, 0) *
                    (+session?.user?.tax / 100)
                  ).toFixed(0)}
                </p>
              </div>
            )}
            <div className="flex justify-between py-1 mt-2 px-2 border-t-2  border-dotted border-black ">
              <p> Net Amount</p>
              <p>{getNetAmount()}</p>
            </div>
            <div className="flex justify-between py-1  px-2  ">
              <p> Cash Received</p>
              <p>{paymentData.payAmount}</p>
            </div>

            <div className="flex justify-between py-1  px-2 border-t-2  border-dotted border-black ">
              <p> {getCharge() < 0 ? "Credit" : "Charge"} </p>
              <p>{Math.abs(+getCharge())}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between w-full items-center my-2 mb-5 ">
            <p>Thank you</p>
            <img
              src="https://flashmallmm.com/img/2.f86d3108.png"
              className="w-[35px] h-[35px] my-2 block"
            />
            <p className="font-light">
              Power by Light Idea Software Development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
