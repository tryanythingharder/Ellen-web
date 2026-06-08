"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Project } from "@/types/content";
import { ProjectFlowCanvas } from "./ProjectFlowCanvas";
import { ProjectIndex } from "./ProjectIndex";
import { ViewSwitch } from "./ViewSwitch";
import styles from "./ProjectFlow.module.scss";

type ProjectFlowProps = {
  projects: Project[];
};

export function ProjectFlow({ projects }: ProjectFlowProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hoverLabelRef = useRef<HTMLDivElement | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);
  const [mode, setMode] = useState<"overview" | "index">("overview");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [hoverProject, setHoverProject] = useState<Project | null>(null);

  const clearPendingNavigation = useCallback(() => {
    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  const handleActivateProject = useCallback((project: Project, tileKey: string) => {
    clearPendingNavigation();
    setActiveProjectId(tileKey);

    if (project.slug) {
      navigationTimeoutRef.current = window.setTimeout(() => {
        navigationTimeoutRef.current = null;
        router.push(`/${project.slug}`);
      }, 520);
    }
  }, [clearPendingNavigation, router]);

  const handleModeChange = useCallback((nextMode: "overview" | "index") => {
    clearPendingNavigation();
    setActiveProjectId(null);
    setHoverProject(null);
    setMode(nextMode);
  }, [clearPendingNavigation]);

  const handleHoverProject = useCallback(
    (project: Project | null, pointer?: { x: number; y: number }) => {
      if (pointer && hoverLabelRef.current) {
        hoverLabelRef.current.style.setProperty("--label-x", `${pointer.x}px`);
        hoverLabelRef.current.style.setProperty("--label-y", `${pointer.y}px`);
      }

      setHoverProject(project);
    },
    [],
  );

  const handlePointerMove = useCallback((pointer: { x: number; y: number }) => {
    if (!hoverLabelRef.current) {
      return;
    }

    hoverLabelRef.current.style.setProperty("--label-x", `${pointer.x}px`);
    hoverLabelRef.current.style.setProperty("--label-y", `${pointer.y}px`);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      clearPendingNavigation();
      setActiveProjectId(null);
      setHoverProject(null);
    }
  }, [clearPendingNavigation, pathname]);

  useEffect(() => () => {
    clearPendingNavigation();
  }, [clearPendingNavigation]);

  return (
    <section
      className={styles.stage}
      data-active-route={pathname === "/"}
      data-mode={mode}
    >
      <h1 className="sr-only">Projects</h1>
      <div className={styles.background} />
      <ProjectFlowCanvas
        activeProjectId={activeProjectId}
        mode={mode}
        onActivateProject={handleActivateProject}
        onHoverProject={handleHoverProject}
        onPointerMove={handlePointerMove}
        projects={projects}
      />
      <div
        ref={hoverLabelRef}
        className={styles.hoverLabel}
        data-visible={mode === "overview" && Boolean(hoverProject)}
      >
        {hoverProject?.title}
      </div>
      <div className={styles.vignette} />
      <div className={styles.overflowMask} />

      {mode === "index" ? <ProjectIndex projects={projects} onNavigate={clearPendingNavigation} /> : null}
      <ViewSwitch mode={mode} onChange={handleModeChange} />
    </section>
  );
}
