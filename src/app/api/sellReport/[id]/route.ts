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

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    console.log("sell report");
    const session = (await getServerSession(authOptions)) as any;
    const id = getParams(request.url);
    console.log(id, "fwjfioweo9p");
    const { customer_id } = (await getQuery(request.url)) as {
      customer_id: string;
    };
    let lastIndexSnapshot: any = null;

    const voucherDetailCollectionRef = collection(
      db,
      session.user.city,
      session.user.shopId,
      "sellProducts"
    );

    let queryRef = query(
      voucherDetailCollectionRef,
      where("vouncherId", "==", id)
    );
    const VouncherDetailSnapshot = await getDocs(queryRef);
    let VoucherDetailData = VouncherDetailSnapshot.docs[0].data();
    VoucherDetailData.costPerItem = [];
    for (let i = 0; i < VoucherDetailData.countList.length; i++) {
      VoucherDetailData.costPerItem.push(
        parseInt(VoucherDetailData.sellPriceList[i]) *
          parseInt(VoucherDetailData.countList[i])
      );
    }
    VoucherDetailData.totalPrice = VoucherDetailData.costPerItem.reduce(
      (a: any, b: any) => a + b,
      0
    );
    const paymentHistoryRef = collection(
      db,
      session.user.city,
      session.user.shopId,
      "sellProducts",
      VoucherDetailData.id,
      "record"
    );
    const paymentHistorySnapshot = await getDocs(paymentHistoryRef);

    const paymentHistory = [] as any;
    paymentHistorySnapshot.forEach((doc) => {
      const data = doc.data();
      paymentHistory.push(data);
    });
    let customerSnapshot: any = null;
    if (customer_id) {
      const customerRef = query(
        collection(db, session.user.city, session.user.shopId, "customer"),
        where("id", "==", customer_id)
      );

      customerSnapshot = await getDocs(customerRef);
    }
    const json_response = {
      status: "success",
      data: {
        customerInfo: customerSnapshot?.docs[0]?.data() || null,
        paymentHistory,
        voucherDetail: VoucherDetailData,
      },
    };

    return NextResponse.json(json_response, { status: 200 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
