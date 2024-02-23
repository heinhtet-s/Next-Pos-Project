import authOptions from "@/lib/authOptions";
import { db } from "@/lib/firebase";
import { errorResponse, getQuery } from "@/lib/globalFunction";
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
export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const { lastIndex, search, dateType, selectedDate } = (await getQuery(
      request.url
    )) as {
      lastIndex: string;
      search: string;
      dateType: string;
      category: string;
      date: string;
      selectedDate: string;
    };
    let lastIndexSnapshot: any = null;
    if (lastIndex) {
      const lastIndexQuery = query(
        collection(db, session.user.city, session.user.shopId, "sellProducts"),
        where("id", "==", lastIndex)
      );
      lastIndexSnapshot = await getDocs(lastIndexQuery);
      lastIndexSnapshot = lastIndexSnapshot?.docs[0];
    }
    const sellProductsCollectionRef = collection(
      db,
      session.user.city,
      session.user.shopId,
      "sellProducts"
    );

    let queryRef = query(
      sellProductsCollectionRef,
      where(dateType, "==", selectedDate),
      orderBy("time", "desc")
    );

    if (search) {
      queryRef = query(
        queryRef,
        where("vouncherId", ">=", search),
        where("vouncherId", "<=", search + "\uf8ff")
      );
    }
    console.log(lastIndex, "lastIndex");
    if (lastIndex) {
      queryRef = query(queryRef, limit(15), startAfter(lastIndexSnapshot));
    } else {
      queryRef = query(queryRef, limit(15));
    }

    const snapshot = await getDocs(queryRef);

    const invoices = [] as any;
    let income = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("fwefwefwefweffe");
      invoices.push(data);
      income += parseInt(data.totalPrice);
    });
    const lasIndexId =
      snapshot?.docs?.length === 15
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    const json_response = {
      status: "success",
      lastIndex: lasIndexId,
      data: {
        invoices: invoices,
        income,
      },
    };

    return NextResponse.json(json_response, { status: 200 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
