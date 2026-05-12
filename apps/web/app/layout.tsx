import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "HunterOS",
  description: "Operating system for bounty hunters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en" className="dark h-full">
        <body className="h-full overflow-y-auto bg-gray-950">{children}</body>
      </html>
    </SessionProvider>
  );
}
