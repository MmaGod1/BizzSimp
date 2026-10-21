import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizzSimp — Simple sales advice",
  description:
    "Turn a sales CSV into a clear, plain-language monthly summary.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
