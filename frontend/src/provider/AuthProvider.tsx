"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type Props = {};

export type UserInfo = {
  id: string;
  username: string;
  email: string;
};

export const AuthContext = createContext<{
  authenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: UserInfo;
  setUser: (user: UserInfo) => void;
}>({
  authenticated: false,
  setAuthenticated: () => {},
  user: { username: "", id: "", email: "" },
  setUser: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo>({
    username: "",
    id: "",
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userInfo || !token) {
      setAuthenticated(false);
      // router.push("/login");
    } else {
      setAuthenticated(true);
      const user: UserInfo = JSON.parse(userInfo);
      if (user) {
        setUser({
          username: user.username,
          id: user.id,
          email: user.email,
        });
      }
    }
  }, [authenticated]);

  return (
    <AuthContext.Provider
      value={{
        authenticated: authenticated,
        setAuthenticated: setAuthenticated,
        user: user,
        setUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuthContext = () => useContext(AuthContext);
