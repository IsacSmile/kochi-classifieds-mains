import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const baseUrl = process.env.NEXTAUTH_URL || "https://kochiclassifieds.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "KochiClassifieds - Local Business Directory in Kochi, Kerala",
    template: "%s | KochiClassifieds",
  },
  description:
    "Find verified local businesses, shops, doctors, restaurants, and services across Kochi, Ernakulam, Kakkanad, and Aluva. List your business free.",
  openGraph: {
    title: "KochiClassifieds - Local Business Directory in Kochi, Kerala",
    description:
      "Find verified local businesses, shops, doctors, restaurants, and services across Kochi, Ernakulam, Kakkanad, and Aluva. List your business free.",
    url: baseUrl,
    siteName: "KochiClassifieds.in",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KochiClassifieds - Local Business Directory in Kochi",
    description: "Find verified local businesses and services in Kochi, Kerala.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
