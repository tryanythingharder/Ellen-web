import type { MediaAsset, Project } from "@/types/content";

const mediaTypes = new Set(["image", "video", "placeholder"]);
const layoutVariants = new Set(["feature", "diptych", "sequence"]);
const captionModes = new Set(["inline", "under"]);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

export function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const asset = value as Partial<MediaAsset>;

  return (
    isString(asset.id) &&
    isString(asset.alt) &&
    isOptionalString(asset.src) &&
    isOptionalString(asset.poster) &&
    isOptionalString(asset.caption) &&
    isOptionalString(asset.aspectRatio) &&
    typeof asset.type === "string" &&
    mediaTypes.has(asset.type)
  );
}

export function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") {
    return false;
  }

  const project = value as Partial<Project>;
  const layoutVariantIsValid =
    project.layoutVariant === undefined || layoutVariants.has(project.layoutVariant);
  const captionModeIsValid =
    project.captionMode === undefined || captionModes.has(project.captionMode);

  return (
    isString(project.id) &&
    isString(project.title) &&
    isOptionalString(project.slug) &&
    isOptionalString(project.subtitle) &&
    isOptionalString(project.year) &&
    (project.tags === undefined || isStringList(project.tags)) &&
    (project.thumbnail === undefined || isMediaAsset(project.thumbnail)) &&
    Array.isArray(project.items) &&
    project.items.every(isMediaAsset) &&
    layoutVariantIsValid &&
    captionModeIsValid
  );
}

export function isProjectList(value: unknown): value is Project[] {
  return Array.isArray(value) && value.every(isProject);
}
