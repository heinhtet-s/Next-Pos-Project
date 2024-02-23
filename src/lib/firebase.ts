// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore, Timestamp } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDKQIHwerypNjkvJWjYF96O8jWZgOSri6c",
//   authDomain: "flash-mall-ed921.firebaseapp.com",
//   projectId: "flash-mall-ed921",
//   storageBucket: "flash-mall-ed921.appspot.com",
//   messagingSenderId: "833764220183",
//   appId: "1:833764220183:web:8d9391988f6e72e6932b52",
//   measurementId: "G-51ZE8ZWVB3",
// };
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const storage = getStorage(app);
// const auth = getAuth(app);

// export { db, storage, Timestamp, auth };
import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { FieldValue } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKQIHwerypNjkvJWjYF96O8jWZgOSri6c",
  authDomain: "flash-mall-ed921.firebaseapp.com",
  projectId: "flash-mall-ed921",
  storageBucket: "flash-mall-ed921.appspot.com",
  messagingSenderId: "833764220183",
  appId: "1:833764220183:web:509b8768f6c97733932b52",
  measurementId: "G-7SH7VFGLPM",
};

const firebaseApp = initializeApp(firebaseConfig);
// const messaging = getMessaging(firebaseApp);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { Timestamp, db, auth, firebaseApp, storage };
