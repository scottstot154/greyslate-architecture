import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GreySlate Architecture", template: "%s | GreySlate Architecture" },
  description: "GreySlate is an independent architecture studio working across architecture, interiors, and adaptive reuse.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en"><body>{children}</body></html>;
}
