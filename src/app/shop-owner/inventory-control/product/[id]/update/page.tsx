"use client";
import * as z from "zod";
import ProductForm from "@/components/dashboard/ProductForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
function page() {
  const { id } = useParams();
  const { data: session } = useSession() as any;
  const [productData, setProductData] = useState<any>();

  useEffect(() => {
    const unsubscribe = async () => {
      if (!session) return;
      const productRef = collection(
        db,
        session?.user?.city,
        session?.user?.shopId,
        "products"
      );
      const productQuery = query(productRef, where("id", "==", id));
      const unsubscribe = await getDocs(productQuery).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setProductData(doc.data());
          console.log(doc.data());
        });
      });
    };
    return () => {
      unsubscribe();
    };
  }, [id, session]);
  return (
    <>
      {productData ? (
        <ProductForm productData={productData} />
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
export default page;
