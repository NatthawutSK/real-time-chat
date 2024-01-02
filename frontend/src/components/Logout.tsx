"use client";
import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import React from "react";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { useAuthContext } from "@/provider/AuthProvider";

type Props = {};

function LogoutButton({}: Props) {
  const { toast: showToast } = useToast();
  const router = useRouter();
  const { setAuthenticated, authenticated }: any = useAuthContext();
  const oauth = localStorage.getItem("oauth");
  const Logout = async () => {
    try {
      const response = await fetch(API_URL + "/users/signout", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          oauth_id: oauth,
        }),
      });

      const data = await response.json();

      if (response.status >= 400 && response.status < 600) {
        showToast({
          description: "Logout failed",
          variant: "destructive",
          duration: 1500,
        });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("oauth");
        localStorage.removeItem("user");
        router.push("/login");
        setAuthenticated(false);
      }

      console.log(data);
    } catch (error) {
      console.error(error);
      showToast({
        description: "Something went wrong!",
        variant: "destructive",
        duration: 1500,
      });
    }
  };
  return (
    <Button variant={"destructive"} onClick={Logout}>
      Log out
    </Button>
  );
}

export default LogoutButton;
