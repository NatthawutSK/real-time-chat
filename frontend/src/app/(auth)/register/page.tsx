"use client";
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
import { registerSchema } from "@/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { API_URL } from "@/constants";
type Props = {};

type Input = z.infer<typeof registerSchema>;

function Register({}: Props) {
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { toast: showToast } = useToast();
  const router = useRouter();
  const form = useForm<Input>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (dataValue: Input) => {
    try {
      const response = await fetch(API_URL + "/users/signup", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: dataValue.username,
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
      if (response.status === 201) {
        showToast({
          title: "Register Success",
          description: "You have successfully registered!",
          variant: "success",
          duration: 1500,
        });
        router.push("/login");
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
        <Card className="w-[420px] h-auto">
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="relative space-y-1 overflow-x-hidden"
              >
                <div
                  className={cn(
                    "space-y-3 transition-transform transform translate-x-0 ease-in-out duration-300"
                  )}
                >
                  {/* username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Your Username..."
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* email */}
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
                  {/* password */}
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
                  {/* confirm password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Please confirm your password..."
                              {...field}
                              type={showConfirm ? "text" : "password"}
                            />
                            <span className="ml-2 text-gray-500 text-lg hover:text-black">
                              {showConfirm ? (
                                <FaRegEyeSlash
                                  onClick={() => setShowConfirm(!showConfirm)}
                                />
                              ) : (
                                <FaRegEye
                                  onClick={() => setShowConfirm(!showConfirm)}
                                />
                              )}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className={cn("flex gap-2 relative pt-5")}>
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="text-center mt-4 ">
          Already have an account?{"  "}
          <a href="/login" className="hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
