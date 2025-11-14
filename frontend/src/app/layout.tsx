import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Weather Dashboard",
  description:
    "Track weather conditions from cities around the world in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
