import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: "PF Scout Wishlist", description: "Prototype: Scout checks your saved homes for misleading listings" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
