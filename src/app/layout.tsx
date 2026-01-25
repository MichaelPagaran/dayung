import type { Metadata } from "next";
import { fontMain } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayung",
  description: "Property Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontMain.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
