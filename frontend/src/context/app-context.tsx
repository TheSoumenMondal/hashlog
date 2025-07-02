"use client";

import { User } from "@/types/type";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Base service URLs
export const user_service = "http://localhost:7000";
export const blog = "http://localhost:8000";
export const author = "http://localhost:5000";

// Context shape
interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);


  console.log(user)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setIsAuth(false);
          return setLoading(false);
        }
        console.log("Token from cookies:", token); // <--- add this
        const { data } = await axios.get(`${user_service}/api/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
        setIsAuth(true);
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  if (!clientId) {
    console.error(
      "Missing NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID in environment variables"
    );
  }

  return (
    <AppContext.Provider
      value={{ user, isAuth, loading, setIsAuth, setLoading, setUser }}
    >
      <GoogleOAuthProvider clientId={clientId!}>{children}</GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
