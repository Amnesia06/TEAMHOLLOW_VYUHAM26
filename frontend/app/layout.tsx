import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathwise — Your career, understood.",
  description: "AI-powered career intelligence, transferable skill mapping, and personalized development roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text selection:bg-primary-subtle selection:text-primary">
        {children}
      </body>
    </html>
  );
}
