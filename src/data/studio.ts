import type { StudioPageData } from "@/types/content";

export const studioPageData: StudioPageData = {
  intro:
    "ELLEN is a Paris-based creative studio working across image direction, spatial research, moving image, and editorial systems.",
  clients: [
    "Cartier",
    "Chanel",
    "Dior",
    "Hermes",
    "Loewe",
    "Saint Laurent",
    "The Row",
    "Vogue",
  ],
  services: [
    "Creative direction",
    "Image strategy",
    "Campaign research",
    "Editorial systems",
    "Moving image direction",
    "Spatial and material references",
  ],
  press: [
    "Selected editorial features",
    "Independent image essays",
    "Studio interviews",
  ],
  recognitions: [
    "Cultural collaborations",
    "Independent commissions",
    "Long-form research partnerships",
  ],
  mediaSlots: [
    {
      id: "studio-material-index",
      placement: "after",
      media: {
        id: "studio-material-index-media",
        type: "placeholder",
        alt: "Studio material index placeholder",
        aspectRatio: "16 / 9",
        tone: "light",
      },
    },
  ],
};
