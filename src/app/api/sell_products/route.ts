import authOptions from "@/lib/authOptions";
import { db } from "@/lib/firebase";
import { errorResponse, successResponse } from "@/lib/globalFunction";
import { TodayDateTime } from "@/lib/helper";
import {
  Timestamp,
  addDoc,
  and,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as any;
  const city = session.user.city;

  const shopId = session.user.shopId;
  const checkoutItem = await request.json();
  const updatedCustomerType = async (type: string) => {
    const customerId = checkoutItem?.customerId?.id;
    // Create a reference to the 'customer' document
    const customerRef = doc(db, city, shopId, "customer", customerId);

    // Get the existing data
    const docSnap = await getDoc(customerRef);
    const getData = docSnap.data();
    if (getData) {
      // Define the updated data
      const updatedData = {
        ...getData,
        memberType: type, // Update the memberType field with the new value from 'datas'
      };
      // Update the document with the new data
      await setDoc(customerRef, updatedData);
    }
  };
  async function updateStockAndCreateRecord(p: any, batchedWrite: any) {
    try {
      // Create a reference to the product document
      const productRef = doc(db, city, shopId, "products", p.id);

      // Get the product data
      const productDoc = await getDoc(productRef);
      const originalProduct = productDoc.data();
      if (!originalProduct) return errorResponse("Transaction failed");
      let originalStock = originalProduct.stock;
      let finalStock = 0;
      if (originalStock !== "") {
        finalStock = parseInt(originalStock) - p.count;
      } else {
        finalStock = originalStock;
      }

      // Use batched write to group update and add operations
      batchedWrite.update(productRef, { stock: finalStock + "" });

      // Create a reference to the record document within the product
      const recordRef = doc(
        collection(db, city, shopId, "products", p.id, "records")
      );
      // Use batched write to group add operation
      console.log({
        id: originalProduct.id,
        recordId: recordRef.id,
        itemCode: originalProduct.itemCode,
        barcode: originalProduct.barcode,
        itemName: originalProduct.itemName,
        buyPrice: originalProduct.buyPrice.toString(),
        sellPrice: originalProduct.sellPrice.toString(),
        stock: finalStock + "",
        description: originalProduct.description,
        type: originalProduct.type,
        color: originalProduct.color,
        size: originalProduct.size,
        weight: originalProduct.weight,
        time: Timestamp.now(),
        day: checkoutItem.day,
        month: checkoutItem.month,
        year: checkoutItem.year,
        dateTime: checkoutItem.dateTime,
        rating: originalProduct.rating,
        discount: originalProduct.discount,
        note: "default",
        process: "offlineSell",
        count: "-" + p.count,
      });
      batchedWrite.set(recordRef, {
        id: originalProduct.id,
        recordId: recordRef.id,
        itemCode: originalProduct.itemCode,
        barcode: originalProduct.barcode,
        itemName: originalProduct.itemName,
        buyPrice: originalProduct.buyPrice.toString(),
        sellPrice: originalProduct.sellPrice.toString(),
        stock: finalStock + "",
        description: originalProduct.description,
        type: originalProduct.type,
        color: originalProduct.color,
        size: originalProduct.size,
        weight: originalProduct.weight,
        time: Timestamp.now(),
        day: checkoutItem.day,
        month: checkoutItem.month,
        year: checkoutItem.year,
        dateTime: checkoutItem.dateTime,
        rating: originalProduct.rating,
        discount: originalProduct.discount,
        note: "default",
        process: "offlineSell",
        count: "-" + p.count,
      });
    } catch (error) {
      console.error("Error updating stock and creating record:", error);
    }
  }

  const sellReport = async () => {
    const batchedWrite = writeBatch(db); // Initialize batch
    const product = checkoutItem.itemCodeList?.map(
      (i: string, index: number) => ({
        id: i,
        count: checkoutItem.countList[index],
      })
    );
    const promises = product.map((p: any) =>
      updateStockAndCreateRecord(p, batchedWrite)
    );

    await Promise.all(promises);
    await batchedWrite.commit(); // Commit the batched write
  };

  // check require data
  // if (!name || !description || !roles) {
  //   return errorResponse("Require data");
  // }

  try {
    await runTransaction(db, async (transaction) => {
      const sellProductsCollectionRef = collection(
        db,
        city,
        shopId,
        "sellProducts"
      );
      let sellProductDBId = sellProductsCollectionRef.id;
      checkoutItem.id = sellProductDBId;
      let customerName = "";
      let customerId = "";
      let customerData: any = [];

      if (checkoutItem.customerId !== "") {
        console.log("je;;ofokfpwefk");
        customerName = checkoutItem.name;
        customerId = checkoutItem.customerId;
        let totalPriceArray = 0;
        const queryRef = query(
          sellProductsCollectionRef,
          where("customerId", "==", checkoutItem.customerId)
        );
        const querySnapshot = await getDocs(queryRef);
        customerData = querySnapshot.docs.map((doc) => doc.data());
        querySnapshot.forEach((doc) => {
          totalPriceArray += Number(doc.data().totalPrice);
        });

        // Determine the customer type based on totalPriceArray
        if (totalPriceArray < 100000) {
          updatedCustomerType("Free");
        } else if (totalPriceArray > 100000) {
          updatedCustomerType("Vip");
        } else if (totalPriceArray > 1000000) {
          updatedCustomerType("VVip");
        }
      }

      const sellProductRef = doc(
        db,
        city,
        shopId,
        "sellProducts",
        sellProductDBId
      );
      const revenueReceivedRef = doc(
        db,
        city,
        shopId,
        "revenueReceived",
        sellProductDBId
      );

      // Set the 'checkoutItem' data to the 'sellProducts' document
      transaction.set(sellProductRef, checkoutItem);

      // Calculate the sum of buy and sell prices
      let buyResult = checkoutItem.buyPriceList.map((i: string) => Number(i));
      let finalBuySum = buyResult.reduce((a: number, b: number) => a + b, 0);
      let sellResult = checkoutItem.sellPriceList.map((i: string) => Number(i));
      let finalSellSum = sellResult.reduce((a: number, b: number) => a + b, 0);

      // Calculate the revenue
      const revenues = Number(finalSellSum) - Number(finalBuySum);
      const status = finalSellSum > finalBuySum ? "profit" : "loss";
      const documentData = {
        day: checkoutItem.day,
        id: checkoutItem.id,
        month: checkoutItem.month,
        productBuyPriceList: checkoutItem.buyPriceList,
        productIdList: checkoutItem.itemCodeList,
        productNameList: checkoutItem.nameList,
        productSellPriceList: checkoutItem.sellPriceList,
        revenue: Math.abs(revenues).toString(),
        status: status,
        time: Timestamp.now(),
        voucherId: checkoutItem.vouncherId,
        year: checkoutItem.year,
      };

      transaction.set(revenueReceivedRef, documentData);
      console.log("hello");
      // const voucherRecordRef = doc(
      //   sellProductsCollectionRef,
      //   checkoutItem.id,
      //   "record"
      // );

      const voucherRecordRef = doc(
        collection(db, city, shopId, "sellProducts", checkoutItem.id, "record")
      );
      console.log(
        {
          id: voucherRecordRef.id,
          totalPrice: checkoutItem.totalPrice,
          credit: checkoutItem.credit,
          cashReceived: checkoutItem.cashReceived,
          change: checkoutItem.change,
          note: "",
          paymentMethod: checkoutItem.paymentMethod,
          dateTime: checkoutItem.dateTime,
          time: Timestamp.now(),
        },
        "ggggg"
      );
      transaction.set(voucherRecordRef, {
        id: voucherRecordRef.id,
        totalPrice: checkoutItem.totalPrice.toString(),
        credit: checkoutItem.credit,
        cashReceived: checkoutItem.cashReceived,
        change: checkoutItem.change.toString(),
        note: "",
        paymentMethod: checkoutItem.paymentMethod,
        dateTime: checkoutItem.dateTime,
        time: Timestamp.now(),
      });

      const paymentRef = collection(
        db,
        city,
        shopId,
        "paymentMethods",
        checkoutItem.paymentId,
        "transaction"
      );
      console.log("hello2");
      const transactionDocRef = doc(paymentRef);
      transaction.set(transactionDocRef, {
        id: transactionDocRef.id,
        customerId: customerId,
        customerName: customerName,
        vouncherId: checkoutItem.vouncherId,
        sellProductId: checkoutItem.id,
        cashReceived: checkoutItem.cashReceived.toString(),
        change: checkoutItem.change.toString(),
        credit: checkoutItem.credit.toString(),
        day: checkoutItem.day,
        month: checkoutItem.month,
        year: checkoutItem.year,
        dateTime: checkoutItem.dateTime,
        time: Timestamp.now(),
      });

      const paymentReceivedCollectionRef = collection(
        db,
        city,
        shopId,
        "paymentReceived"
      );

      // Create a reference to a new document within the 'paymentReceived' collection
      const paymentReceivedDocRef = doc(paymentReceivedCollectionRef);

      // Set the new paymentReceived document with the provided data
      transaction.set(paymentReceivedDocRef, {
        day: checkoutItem.day,
        id: paymentReceivedDocRef.id,
        month: checkoutItem.month,
        paymentId: transactionDocRef.id, // Use the transaction document's ID
        paymentName: checkoutItem.paymentMethod,
        receivedAmount: checkoutItem.cashReceived.toString(),
        status: "sell",
        time: Timestamp.now(),
        vouncherId: checkoutItem.vouncherId,
        year: checkoutItem.year,
      });
      console.log(customerData, "customerData");
      if (checkoutItem.customerId !== "") {
        // Make sure 'this.selectedCustomer' is not an empty string or falsy value
        const debt =
          parseInt(customerData[0]?.debt) + parseInt(checkoutItem.credit);

        // Create a reference to the customer document
        const customerRef = doc(
          db,
          city,
          shopId,
          "customer",
          customerData?.[0].id
        );

        // Update the debt in the customer document
        transaction.update(customerRef, {
          debt: debt.toString(),
        });
      }
      console.log("hello1");
      await sellReport();
    });

    return successResponse();
  } catch (error) {
    console.log("Error performing transaction:", error);
    return errorResponse("Transaction failed");
  }
}

// if (this.shopInfo.tax !== "0") {
//     this.checkoutItem.tax = (
//       this.totalPrice *
//       (parseInt(this.shopInfo.tax) / 100)
//     ).toFixed(0);
//     nextTotal = parseInt(this.totalPrice) + parseInt(this.checkoutItem.tax);
//     this.checkoutItem.totalPrice = nextTotal.toString();
//   } else {
//     this.checkoutItem.totalPrice = this.totalPrice.toString();
//   }
