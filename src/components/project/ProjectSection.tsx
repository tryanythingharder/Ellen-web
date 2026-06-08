import { Reveal } from "@/components/common/Reveal";
import { MediaItem } from "@/components/media/MediaItem";
import type { Project } from "@/types/content";
import { ProjectMeta } from "./ProjectMeta";
import styles from "./ProjectSection.module.scss";

type ProjectSectionProps = {
  project: Project;
  index: number;
};

export function ProjectSection({ project, index }: ProjectSectionProps) {
  return (
    <Reveal
      className={styles.project}
      threshold={project.layoutVariant === "feature" ? 0.08 : 0.1}
    >
      <article data-layout={project.layoutVariant ?? "feature"}>
        <ProjectMeta index={index} project={project} />
        <div className={styles.mediaRail}>
          {project.items.map((item, itemIndex) => (
            <MediaItem
              asset={item}
              key={item.id}
              priority={index === 0 && itemIndex === 0}
              videoThreshold={0.42}
            />
          ))}
        </div>
      </article>
    </Reveal>
  );
}
