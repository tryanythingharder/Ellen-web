import type { Project } from "@/types/content";
import { isProjectList } from "./contentValidation";

export const contentDraftStorageKey = "ellen:content-draft:v1";
export const contentDraftChangeEvent = "ellen:content-draft-change";

export type ContentDraft = {
  projects: Project[];
  updatedAt: string;
};

export function isContentDraft(value: unknown): value is ContentDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<ContentDraft>;

  return isProjectList(draft.projects) && typeof draft.updatedAt === "string";
}
