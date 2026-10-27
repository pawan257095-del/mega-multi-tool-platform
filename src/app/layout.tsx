import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";
import PwaRegister from "@/components/pwa-register";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Toolbox — Free Online Tools",
    template: "%s | Toolbox",
  },
  description:
    "A growing collection of free online tools for PDFs, images, text, developers, and everyday calculations.",
  applicationName: "Toolbox",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Toolbox",
    title: "Toolbox — Free Online Tools",
    description:
      "A growing collection of free online tools for PDFs, images, text, developers, and everyday calculations.",
  },
  twitter: {
    card: "summary",
    title: "Toolbox — Free Online Tools",
    description:
      "A growing collection of free online tools for PDFs, images, text, developers, and everyday calculations.",
  },
  keywords: ["online tools", "PDF tools", "image converter", "word counter", "developer tools"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Toolbox" },
  icons: {
    icon: [
      { url: "/toolbox-icon.svg", type: "image/svg+xml" },
      { url: "/toolbox-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/toolbox-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6d28d9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
