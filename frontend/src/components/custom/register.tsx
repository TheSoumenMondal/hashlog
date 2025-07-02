"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { user_service } from "@/context/app-context";
import { useGoogleLogin } from "@react-oauth/google";

export function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${user_service}/api/v1/register`, formData);
      if (res.status === 201 || res.status === 200) {
        router.push("/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${user_service}/api/v1/google-login`, {
          token: tokenResponse.access_token,
        });

        if (res.status === 200) {
          Cookies.set("token", res.data.token);
          router.push("/");
        } else {
          setError("Google login failed.");
        }
      } catch (err: any) {
        setError("Google login error. Please try again.");
      }
    },
    onError: () => {
      setError("Google login failed.");
    },
    flow: "implicit",
  });

  
  return (
    <div className="w-full flex items-center justify-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register a new account</CardTitle>
          <CardDescription>
            Enter your name, email, and password to register.
          </CardDescription>
          <CardAction>
            <Link href={"/login"}>
              <Button variant="link" className="cursor-pointer">
                Login
              </Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <CardFooter className="flex-col gap-2 mt-6 px-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => googleLogin()}
                type="button"
              >
                <IconBrandGoogle className="w-4 h-4" />
                Register with Google
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
