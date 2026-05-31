import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes Trismegistus — Alchemical Oracle",
  description: "Consult Hermes Trismegistus, master of alchemy, astrology, and theurgy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg text-[#e8d5a8] min-h-screen">
        {children}
      </body>
    </html>
  );
}
