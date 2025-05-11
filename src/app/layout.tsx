
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GEOcrimes",
  description: "Apliacion para denunciar todo tipo de crimenes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
       
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* <HeroUIProvider>
          <ToastProvider/>
            {children}
          </HeroUIProvider> */}
          {/* <Providers> */}
          {children}
        {/* </Providers> */}
        </body>
      
    </html>
  );
}
