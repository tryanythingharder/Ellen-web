"use client";

import { useState } from "react";
import { contact } from "@/data/contact";
import styles from "./ContactEntry.module.scss";

type ContactEntryProps = {
  variant?: "nav" | "footer";
};

export function ContactEntry({ variant = "nav" }: ContactEntryProps) {
  const [copied, setCopied] = useState(false);

  async function handleContact() {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(contact.email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
        return;
      } catch {
        window.location.href = `mailto:${contact.email}`;
      }
    }

    window.location.href = `mailto:${contact.email}`;
  }

  return (
    <button
      className={styles.entry}
      data-variant={variant}
      onClick={handleContact}
      type="button"
    >
      <span>{copied ? "Email copied" : "Contact"}</span>
    </button>
  );
}
