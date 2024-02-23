import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, RequestInternal } from "next-auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  Firestore,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "LOGIN",
      credentials: {},
      authorize: (credentials: any) => {
        let docData: any; // Declare docData in the outer scope
        const userInfo = JSON.parse(credentials.credentials);
        const q = query(
          collection(db as Firestore, "shopRegistration"),
          where("emailList", "array-contains", userInfo.user.email)
        );

        return getDocs(q)
          .then(async (querySnapshot) => {
            console.log(querySnapshot.docs[0].data(), "querySnapshot");
            const docData = querySnapshot.docs[0].data();

            if (!docData) {
              throw new Error("No shop found");
            }
            const shopDataRef = doc(
              db as Firestore,
              docData?.city,
              docData?.shopId
            );
            return getDoc(shopDataRef);
          })
          .then((shopData) => {
            console.log(shopData.data(), "shopData");
            docData = {
              ...shopData.data(),
              shopId: shopData.id,
            };
            console.log(
              userInfo.user.email,
              "shopQuery",
              docData.city,
              docData.id
            );
            const shopQuery = query(
              collection(
                db as Firestore,
                docData.city,
                docData.shopId,
                "account"
              ),
              where("email", "==", userInfo.user.email)
            );

            return getDocs(shopQuery);
          })
          .then((userData) => {
            console.log(userData.docs[0].data(), "userData");
            // if (userData.docs[0]?.data().loginStatus === "true") {
            //   throw new Error("Already logged in");
            // }
            docData = {
              ...docData,
              ...userData.docs[0].data(),
            };
            // const userRef = doc(
            //   db as Firestore,
            //   docData.city,
            //   docData.shopId,
            //   "account",
            //   userData.docs[0].id
            // );
            // console.log(docData, "userRef");
            // return updateDoc(userRef, {
            //   loginStatus: "true",
            //   deviceId: credentials.deviceId,
            // });
          })
          .then(() => {
            return {
              ...docData,
            };
          })
          .catch((error) => {
            console.error(error);

            if (error.code === "auth/email-already-in-use") {
              throw new Error("Email is already in use!");
            } else if (error.code === "auth/user-not-found") {
              throw new Error("User not found");
            } else {
              console.log(error);
              throw new Error(error);
            }
          });
      },
    }),
  ],
  secret: "pos-flashmall-secret",
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          ...token,
        },
      };
    },
    jwt: ({ token, user, account }) => {
      if (account) {
        token = { ...token, ...user };
      }

      return token;
    },
  },
};

export default authOptions;
