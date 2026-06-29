import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReduxProvider from "@/store/provider";
import AuthBootstrap from "@/components/auth/AuthBootstrap";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Travel Amigo — Sri Lanka Travel Planner",
  description:
    "Plan your Sri Lanka trip with a day-by-day itinerary, estimated costs, routes, and local travel tips.",
  openGraph: {
    title: "Travel Amigo — Sri Lanka Travel Planner",
    description: "Plan your Sri Lanka adventure in minutes. Estimated costs, day-by-day routes, and local tips included.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-stone-900">
        <ReduxProvider>
          <AuthBootstrap />
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
