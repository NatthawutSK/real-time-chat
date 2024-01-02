"use client";
import { useAuthContext } from "@/provider/AuthProvider";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

export default function WithAuth(Component: any) {
  return function WithAuth(props: any) {
    // const accessToken = localStorage.getItem("token");
    const { authenticated }: any = useAuthContext();
    useEffect(() => {
      if (!authenticated) {
        redirect("/login");
      }
    }, []);

    if (!authenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
