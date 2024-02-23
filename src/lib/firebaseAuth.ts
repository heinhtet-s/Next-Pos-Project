import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firebaseApp } from "./firebase";

const login = async (email: string, password: string): Promise<any> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    console.error("Firebase login error:", error);
    return null;
  }
};

export default login;
