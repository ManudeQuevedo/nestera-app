import "./globals.css";

// This root layout is kept minimal - the actual layout is in [locale]/layout.tsx
// This file only ensures globals.css is imported for all routes

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
