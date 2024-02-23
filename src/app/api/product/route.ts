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
async function fetchProductRelationship(
  city: string,
  shopId: string,
  productId: string
) {
  const relationRef = query(
    collection(db, city, shopId, "products", productId, "relation")
  );
  const snapshot = await getDocs(relationRef);
  const relations: any = [];
  snapshot.forEach((doc) => {
    relations.push(doc.data());
  });
  return relations;
}
export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const { lastIndex, search, category } = (await getQuery(request.url)) as {
      lastIndex: string;
      search: string;
      category: string;
    };
    let lastIndexSnapshot: any = null;
    console.log(lastIndex, "lastIndex");
    if (lastIndex) {
      const lastIndexQuery = query(
        collection(db, session.user.city, session.user.shopId, "products"),
        where("id", "==", lastIndex)
      );

      lastIndexSnapshot = await getDocs(lastIndexQuery);
      lastIndexSnapshot = lastIndexSnapshot?.docs[0];
    }

    const productRef = collection(
      db,
      session.user.city,
      session.user.shopId,
      "products"
    );

    let productQuery = query(productRef, orderBy("itemName", "asc"));

    if (search) {
      const qu = query(
        productRef,
        where("itemName", ">=", search),
        where("itemName", "<=", search + "\uf8ff")
      );
      const snapshot = await getCountFromServer(qu);
      const total = snapshot.data().count;
      if (total > 0) {
        productQuery = query(
          productQuery,
          where("itemName", ">=", search),
          where("itemName", "<=", search + "\uf8ff")
        );
      } else {
        productQuery = query(productRef, orderBy("itemCode", "asc"));
        productQuery = query(
          productQuery,
          where("itemCode", "<=", search + "\uf8ff"),
          where("itemCode", ">=", search)
        );
      }
    }

    if (category) {
      productQuery = query(productQuery, where("type", "==", category));
    }

    // const snapshot = await getCountFromServer(productQuery);
    // console.log("snapshot", snapshot);
    // const total = snapshot.data().count;
    // console.log("total", total);
    productQuery = query(
      productQuery,
      limit(15),
      startAfter(lastIndex ? lastIndexSnapshot : 0)
    );
    const productSnapshot = await getDocs(productQuery);
    const lasIndexId =
      productSnapshot?.docs?.length === 15
        ? productSnapshot.docs[productSnapshot.docs.length - 1].id
        : null;

    let products = productSnapshot.docs.map((doc) => doc.data());
    const json_response = {
      status: "success",
      lastIndex: lasIndexId,
      products,
    };

    return NextResponse.json(json_response, { status: 200 });
  } catch (e: any) {
    return errorResponse(e.message);
  }
}
