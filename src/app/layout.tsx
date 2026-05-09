import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Room Remix",
  description: "Verifiable Room-State Interior Design Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

