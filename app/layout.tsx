import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Character Bank - AIキャラクタープロンプト共有サービス",
  description: "AIにキャラクターになりきってもらうためのプロンプトを共有できるサービス",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${inter.variable} antialiased`}
      >
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <Navbar />
            <main>{children}</main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
