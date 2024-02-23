import authOptions from "@/lib/authOptions";
import { db } from "@/lib/firebase";
import { errorResponse } from "@/lib/globalFunction";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    const categoryQuery = query(
      collection(db, session.user.city, session.user.shopId, "category"),
      orderBy("name", "asc")
    );
    const categorySnapshot = await getDocs(categoryQuery);
    const categories = categorySnapshot.docs.map((doc) => doc.data());
    const json_response = {
      status: "success",
      results: categories.length,
      categories,
    };

    return NextResponse.json(json_response, { status: 200 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
