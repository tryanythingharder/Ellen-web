import type { LegalPageData } from "@/types/content";

export const legalPages: Record<"cookie" | "privacy" | "legal", LegalPageData> = {
  cookie: {
    title: "Cookie Policy",
    sections: [
      {
        id: "overview",
        heading: "Overview",
        paragraphs: [
          "This website may use essential cookies or similar technologies required to keep the browsing experience stable and secure.",
          "Non-essential tracking and analytics copy should be confirmed with legal counsel before publication.",
        ],
        bullets: [
          "Essential cookies support basic site delivery.",
          "Analytics or marketing tools are not final in this build.",
          "Users may manage cookies through their browser settings.",
        ],
      },
      {
        id: "updates",
        heading: "Updates",
        paragraphs: [
          "This page is structured as a shared legal template so confirmed policy copy can be replaced without changing page layout.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        id: "overview",
        heading: "Overview",
        paragraphs: [
          "This website may collect limited personal information when visitors contact the studio directly by email or external platforms.",
          "Final retention periods, processor lists, and jurisdiction-specific rights should be confirmed before production launch.",
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        paragraphs: [
          "For privacy-related requests, visitors may contact the studio using the shared contact information in the site footer.",
        ],
      },
    ],
  },
  legal: {
    title: "Legal Notice",
    sections: [
      {
        id: "overview",
        heading: "Overview",
        paragraphs: [
          "This legal notice template reserves the publisher, hosting, intellectual property, and liability sections required for final legal publication.",
          "Specific company registration details, responsible editor information, and hosting provider data remain to be confirmed.",
        ],
      },
      {
        id: "intellectual-property",
        heading: "Intellectual Property",
        paragraphs: [
          "Images, text, layout, and creative materials are presented for the site owner and may not be reused without permission.",
        ],
      },
    ],
  },
};
