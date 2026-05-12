import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark h-full">
      <body className="h-full overflow-y-auto bg-gray-950">{children}</body>
    </html>
  );
}
