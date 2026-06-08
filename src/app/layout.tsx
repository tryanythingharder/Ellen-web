import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "ELLEN",
    template: "%s - ELLEN",
  },
  description:
    "ELLEN is a creative studio using artificial intelligence to expand human creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
