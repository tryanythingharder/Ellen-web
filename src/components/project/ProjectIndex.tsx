import type { Project } from "@/types/content";
import Link from "next/link";
import styles from "./ProjectIndex.module.scss";

type ProjectIndexProps = {
  projects: Project[];
  onNavigate?: () => void;
};

export function ProjectIndex({ projects, onNavigate }: ProjectIndexProps) {
  return (
    <section className={styles.index} aria-label="Project index">
      <div className={styles.header}>
        <span>Project</span>
        <span>Tags</span>
        <span>Year</span>
      </div>
      <ol>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={project.slug ? `/${project.slug}` : "/"} onClick={onNavigate}>
              <span>{project.title}</span>
              <span>{project.tags?.join(", ")}</span>
              <span>{project.year}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
