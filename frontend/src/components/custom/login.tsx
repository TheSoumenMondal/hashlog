"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData, user_service } from "@/context/app-context";
import { IconBrandGoogle } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import Loading from "./loading";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuth, loading, user, setIsAuth, setLoading, setUser } =
    useAppData();
  const router = useRouter();

  // ✅ Safe Redirect After Auth
  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Missing Fields", {
        description: "Please fill in both email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${user_service}/api/v1/login`, {
        email,
        password,
      });

      Cookies.set("token", res.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });

      setIsAuth(true);
      setUser(res.data.user); // optional if user info is returned
      toast.success("Login Successful", {
        description: res.data.message || "Welcome back!",
      });
    } catch (err: any) {
      toast.error("Login Failed", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${user_service}/api/v1/login`, {
        code: authResult["code"],
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });

      setIsAuth(true);
      setUser(result.data.user);
      toast.success("Google Login Successful", {
        description: result.data.message,
      });
    } catch (error: any) {
      toast.error("Google Login Failed", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google Login Error", {
      description: "Something went wrong while signing in with Google.",
    });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
    flow: "auth-code",
  });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link href="/register">
              <Button variant="link">Sign Up</Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => googleLogin()}
          >
            <IconBrandGoogle className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
