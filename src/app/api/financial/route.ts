import authOptions from "@/lib/authOptions";
import { db } from "@/lib/firebase";
import { errorResponse, getParams, getQuery } from "@/lib/globalFunction";
import {
  and,
  collection,
  getCountFromServer,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
const getProfit = (products: any) => {
  let myCapital = 0;
  let myIncome: number = 0;
  for (let i = 0; i < products.length; i++) {
    console.log(
      "sell price",
      products[i].sellPrice,
      ", discount: " + products[i].discount
    );

    if (products[i].stock) {
      let sellPrice: any = 0;
      if (parseInt(products[i].discount) > 0) {
        sellPrice =
          parseInt(products[i].sellPrice) -
          parseInt(products[i].sellPrice) *
            (parseInt(products[i].discount) / 100);
      } else {
        sellPrice = products[i].sellPrice;
      }
      myCapital += parseInt(products[i].buyPrice) * parseInt(products[i].stock);
      myIncome += parseInt(sellPrice) * parseInt(products[i].stock);
    }
  }
  return myIncome - myCapital;
};
const getProfitByMonth = (products: any) => {
  let sellProducts: any[] = [];
  let monthlyIncome = 0;
  let monthlyProfit = 0;
  let resultMonthlyProfit = 0;
  products.docs.forEach((doc: any, index: number) => {
    let product = doc.data();
    product.countList.forEach((count: string[], i: number) => {
      monthlyIncome +=
        parseInt(product.buyPriceList[i]) * parseInt(product.countList[i]);
    });
    monthlyProfit += parseInt(product.totalPrice);
    sellProducts.push(product);
  });
  resultMonthlyProfit = monthlyProfit - monthlyIncome;
  return {
    monthlyIncome,
    monthlyProfit,
    resultMonthlyProfit,
    inVoiceCount: sellProducts.length,
  };
};
export async function GET(request: NextRequest, response: NextResponse) {
  try {
    console.log("sell report");
    const session = (await getServerSession(authOptions)) as any;

    const { month, day } = (await getQuery(request.url)) as {
      month: string;
      day: string;
    };
    const productCollection = collection(
      db,
      session.user.city,
      session.user.shopId,
      "products"
    );

    const productSnapshot = await getDocs(productCollection);
    let products = productSnapshot.docs.map((doc) => doc.data());
    let capital = 0;
    for (let i = 0; i < products.length; i++) {
      if (products[i].stock) {
        capital += parseInt(products[i].buyPrice) * parseInt(products[i].stock);
      }
    }
    const sellIncome = getProfit(products);
    let monthlyIncome: any;
    if (month) {
      const sellProductsCollection = collection(
        db,
        session.user.city,
        session.user.shopId,
        "sellProducts"
      );
      const monthQuery = query(
        sellProductsCollection,
        where("month", "==", month)
      );
      const monthProductSnapshot = await getDocs(monthQuery);

      monthlyIncome = getProfitByMonth(monthProductSnapshot);
    }
    const paymentReceivedCollection = collection(
      db,
      session.user.city,
      session.user.shopId,
      "paymentReceived"
    );
    const dayQuery = query(paymentReceivedCollection, where("day", "==", day));
    let paymentReceives = 0;
    getDocs(dayQuery)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          paymentReceives += parseInt(doc.data().receivedAmount);
        });
      })
      .catch((error) => {
        console.error("Error getting paymentReceived:", error);
      });

    const expenseCollection = collection(
      db,
      session.user.city,
      session.user.shopId,
      "expenses"
    );
    const dayExpenseQuery = query(expenseCollection, where("date", "==", day));
    let expenseTotalAmount = 0;
    try {
      const querySnapshot = await getDocs(dayExpenseQuery);

      querySnapshot.forEach((doc) => {
        expenseTotalAmount += parseInt(doc.data().amount);
      });
    } catch (error) {
      console.error("Error getting expense amount:", error);
    }

    const incomesCollection = collection(
      db,
      session.user.city,
      session.user.shopId,
      "incomes"
    );

    const dayIncomeQuery = query(incomesCollection, where("date", "==", day));
    let additionalIncomes = 0;
    try {
      const querySnapshot = await getDocs(dayIncomeQuery);

      querySnapshot.forEach((doc) => {
        additionalIncomes += parseInt(doc.data().amount);
      });
    } catch (error) {
      console.error("Error getting additional incomes:", error);
    }

    const json_response = {
      status: "success",
      data: {
        capital,
        sellIncome,
        paymentReceives,
        expenseTotalAmount,
        additionalIncomes,
        monthlyIncome,
      },
    };

    return NextResponse.json(json_response, { status: 200 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
