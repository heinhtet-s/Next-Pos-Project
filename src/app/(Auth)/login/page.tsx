"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signOut as NextAuthSignout } from "next-auth/react";
import { getAuth, signOut } from "firebase/auth";
import { auth, db, firebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please Enter Email" })
    .email("This is not a valid email."),
  password: z.string().min(1, { message: "Please Enter Password" }),
});

export default function Login() {
  const userAgent = navigator?.userAgent || "none";
  const { data: session, status } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ktwo.tester@gmail.com",
      password: "tst123456",
    },
  });
  const router = useRouter();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const credentials = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const result = await signIn("credentials", {
        deviceId: userAgent,
        credentials: JSON.stringify(credentials),
        callbackUrl: "/",
        redirect: false,
      });
      if (!result?.error) {
        toast.error(result?.error);
      }
      router.push("/shop-owner/sell-product");
      toast.success("Login Success");
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        console.log("User is logged in:", user);
        // You can access user information like user.uid, user.email, etc.
      } else {
        // User is signed out.
        console.log("User is not logged in");
      }
    });

    return () => {
      // Unsubscribe the observer to avoid memory leaks
      unsubscribe();
    };
  }, []);
  console.log(session, "session");
  return (
    <div className="flex items-center h-screen justify-center flex-row">
      <Card className="w-[350px] h-fit">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent>
              <div className="grid w-full h-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="example@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col mt-3  space-y-1.5">
                  <Button className="m-0" type="submit">
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
      <Button
        className="m-0"
        onClick={() => {
          signOut(auth)
            .then(() => {
              NextAuthSignout();
            })
            .catch((error) => {
              // An error happened.
            });
        }}
      >
        signout
      </Button>
    </div>
  );
}
