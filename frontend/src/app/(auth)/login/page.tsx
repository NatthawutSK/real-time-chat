"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { UserInfo, useAuthContext } from "@/provider/AuthProvider";
import WithoutAuth from "@/components/WithoutAuth";
type Props = {};

type Input = z.infer<typeof loginSchema>;

const Login = ({}: Props) => {
  const [showPass, setShowPass] = useState<boolean>(false);
  const { toast: showToast } = useToast();
  const router = useRouter();
  const { setAuthenticated, authenticated }: any = useAuthContext();
  const form = useForm<Input>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // const { toast: showToast } = useToast();

  const onSubmit = async (dataValue: Input) => {
    try {
      const response = await fetch(API_URL + "/users/signin", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: dataValue.email,
          password: dataValue.password,
        }),
      });

      const data = await response.json();

      if (response.status >= 400 && response.status < 600) {
        showToast({
          description: data.message,
          variant: "destructive",
          duration: 1500,
        });
      }
      if (response.status === 200) {
        localStorage.setItem("token", data.token.access_token);
        localStorage.setItem("oauth", data.token.id);
        const user: UserInfo = {
          username: data.user.username,
          email: data.user.email,
          id: data.user.id,
        };
        localStorage.setItem("user", JSON.stringify(user));
        showToast({
          title: "Login Success!",
          description: "You have successfully logged in!",
          variant: "success",
          duration: 1500,
        });
        router.push("/");
        setAuthenticated(true);
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
    <div className="flex items-center justify-center h-screen">
      <div>
        <Card className="w-[420px]">
          <CardHeader>
            <CardTitle className="text-center">
              Login {JSON.stringify(authenticated)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Enter your password..."
                            {...field}
                            type={showPass ? "text" : "password"}
                          />
                          <span className="ml-2 text-gray-500 text-lg hover:text-black">
                            {showPass ? (
                              <FaRegEyeSlash
                                onClick={() => setShowPass(!showPass)}
                              />
                            ) : (
                              <FaRegEye
                                onClick={() => setShowPass(!showPass)}
                              />
                            )}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="text-center w-full " type="submit">
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="text-center mt-4">
          Don't have an account?{"  "}
          <a href="/register" className="hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default WithoutAuth(Login);
