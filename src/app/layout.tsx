import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Kochi Classifieds Admin",
  description: "Admin portal for Kochi Classifieds Local Business Directory Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-brand-navy min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
