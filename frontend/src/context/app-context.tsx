"use client";

import { blogType, User } from "@/types/type";
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
import { toast } from "sonner";

// Base service URLs
export const user_service = "http://localhost:7000";
export const blog_service = "http://localhost:8000";
export const author_service = "http://localhost:5000";

interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  loadingFilters: boolean;
  category: string;
  searchQuery: string;
  blogs: blogType[] | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setBlogs: React.Dispatch<React.SetStateAction<blogType[] | []>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  LogoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(false); // new state
  const [blogs, setBlogs] = useState<blogType[] | []>([]);
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const LogoutUser = async () => {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.info("Logged out successfully");
  };

  const fetchUser = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${user_service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const FilterBlogs = async () => {
    setLoadingFilters(true); // start loading
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (searchQuery) params.append("searchQuery", searchQuery);

      const url = `${blog_service}/api/v1/blogs/all?${params.toString()}`;

      const { data } = await axios.get(url);
      setBlogs(data || []);
    } catch (error) {
      console.error("Error filtering blogs:", error);
      toast.error("Failed to load blogs.");
      setBlogs([]);
    } finally {
      setLoadingFilters(false); // end loading
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    FilterBlogs();
  }, [category, searchQuery]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  if (!clientId) {
    console.error(
      "Missing NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID in environment variables"
    );
    return <div>Error: Missing Google OAuth Client ID</div>;
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        loadingFilters,
        searchQuery,
        blogs,
        setBlogs,
        setCategory,
        setSearchQuery,
        category,
        setIsAuth,
        setLoading,
        setLoadingFilters,
        setUser,
        LogoutUser,
      }}
    >
      <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
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
