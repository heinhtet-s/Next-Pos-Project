"use client";
import { store } from "@/lib/store";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import NextAdapterApp from "next-query-params/app";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={true}
      />

      <Provider store={store}>
        <SessionProvider>
          <QueryParamProvider adapter={NextAdapterApp}>
            <ProgressBar
              height="4px"
              color="#c70ca8"
              options={{ showSpinner: false }}
              shallowRouting
            />
            {children}
          </QueryParamProvider>
        </SessionProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default AppProvider;
