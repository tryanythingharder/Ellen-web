"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ContactOverlay } from "@/components/contact/ContactOverlay";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);

  if (pathname.startsWith("/admin")) {
    return <main id="content">{children}</main>;
  }

  return (
    <>
      <Header
        contactOpen={contactOpen}
        onContactToggle={() => setContactOpen((open) => !open)}
      />
      <main id="content">
        <PageTransition>{children}</PageTransition>
      </main>
      <ContactOverlay open={contactOpen} />
      <Footer visible={contactOpen} />
    </>
  );
}
