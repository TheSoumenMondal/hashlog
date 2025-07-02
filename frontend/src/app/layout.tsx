import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Navbar from "@/components/custom/Navbar";
import { AppProvider } from "@/context/app-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hashlog",
  description: "Blog App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="hide-scrollbar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="w-full flex flex-col items-center">
              <header className="fixed top-0 w-full h-16 z-10 px-4">
                <div className="max-w-4xl mx-auto w-full">
                  <Navbar />
                </div>
              </header>

              <div className="mt-16 max-w-4xl w-full px-4">
                <main>{children}</main>
              </div>
            </div>
          </ThemeProvider>
        </AppProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
