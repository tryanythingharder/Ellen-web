"use client";

import { useEffect, useState } from "react";
import { ProjectFlow } from "@/components/project/ProjectFlow";
import {
  contentDraftChangeEvent,
  contentDraftStorageKey,
  isContentDraft,
} from "@/data/contentDraft";
import type { Project } from "@/types/content";

type DraftProjectProviderProps = {
  projects: Project[];
};

function readDraftProjects(fallbackProjects: Project[]) {
  try {
    const stored = window.localStorage.getItem(contentDraftStorageKey);

    if (!stored) {
      return fallbackProjects;
    }

    const parsed: unknown = JSON.parse(stored);

    return isContentDraft(parsed) ? parsed.projects : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

export function DraftProjectProvider({ projects }: DraftProjectProviderProps) {
  const [activeProjects, setActiveProjects] = useState(projects);

  useEffect(() => {
    const syncDraft = () => setActiveProjects(readDraftProjects(projects));

    syncDraft();
    window.addEventListener("storage", syncDraft);
    window.addEventListener(contentDraftChangeEvent, syncDraft);

    return () => {
      window.removeEventListener("storage", syncDraft);
      window.removeEventListener(contentDraftChangeEvent, syncDraft);
    };
  }, [projects]);

  return <ProjectFlow projects={activeProjects} />;
}
