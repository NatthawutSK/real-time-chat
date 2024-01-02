"use client";
import { useAuthContext } from "@/provider/AuthProvider";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

export default function WithoutAuth(Component: any) {
  return function WithoutAuth(props: any) {
    const accessToken = localStorage.getItem("token");
    const { authenticated }: any = useAuthContext();
    useEffect(() => {
      if (authenticated || accessToken) {
        redirect("/");
      }
    }, []);

    if (authenticated || accessToken) {
      return null;
    }

    return <Component {...props} />;
  };
}
