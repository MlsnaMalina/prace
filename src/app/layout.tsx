import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nabídky práce",
  description: "Přehled pracovních nabídek pro Michala.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
