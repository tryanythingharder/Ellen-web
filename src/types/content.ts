export type MediaAsset = {
  id: string;
  type: "image" | "video" | "placeholder";
  src?: string;
  poster?: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
  tone?: "light" | "mid" | "dark";
};

export type Project = {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  year?: string;
  tags?: string[];
  thumbnail?: MediaAsset;
  items: MediaAsset[];
  layoutVariant?: "feature" | "diptych" | "sequence";
  captionMode?: "inline" | "under";
};

export type ResearchEntry = {
  id: string;
  title?: string;
  media: MediaAsset;
  type?: string;
  aspectRatio?: string;
  interactionMode?: "display" | "expandable";
};

export type StudioMediaSlot = {
  id: string;
  media: MediaAsset;
  placement?: "before" | "after";
};

export type StudioPageData = {
  intro?: string;
  clients: string[];
  services: string[];
  press: string[];
  recognitions: string[];
  mediaSlots?: StudioMediaSlot[];
};

export type LegalPageData = {
  title: string;
  sections: {
    id: string;
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
};

export type ContactData = {
  email: string;
  instagram: string;
  address: string;
  mapUrl: string;
};
