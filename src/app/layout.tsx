import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WORDJAM — Jamaica's Creole-Affirming Literacy Platform",
  description:
    "Bridging Jamaican Patwa and Standard English for learners from Early Childhood through Grade 11. Culturally rooted. AI-powered. NSC-aligned.",
  openGraph: {
    title: "WORDJAM",
    description:
      "Jamaica's Creole-Affirming Literacy Platform — Every word. Every voice. Every yard.",
    type: "website",
  },
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
