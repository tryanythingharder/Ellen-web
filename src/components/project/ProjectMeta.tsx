import type { Project } from "@/types/content";
import styles from "./ProjectMeta.module.scss";

type ProjectMetaProps = {
  project: Project;
  index: number;
};

export function ProjectMeta({ project, index }: ProjectMetaProps) {
  return (
    <header className={styles.meta}>
      <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
      <div className={styles.copy}>
        <h2>{project.title}</h2>
        {project.subtitle ? <p>{project.subtitle}</p> : null}
      </div>
    </header>
  );
}
