import type { Metadata } from "next";
import "./globals.css";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(productionHost ? `https://${productionHost}` : "http://localhost:3000"),
  title: "TaskBoard - Simple task planning",
  description: "A simple, private to-do list that keeps your tasks on this device.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "TaskBoard",
    description: "Your work, clearly organised",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "TaskBoard task list preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskBoard",
    description: "Your work, clearly organised",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

