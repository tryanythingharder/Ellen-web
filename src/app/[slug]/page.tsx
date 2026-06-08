import { notFound } from "next/navigation";
import { MediaItem } from "@/components/media/MediaItem";
import { projects } from "@/data/projects";
import styles from "./page.module.scss";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projects
    .filter((project) => project.slug)
    .map((project) => ({
      slug: project.slug,
    }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return {
    title: project?.title ?? "Project",
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  const mediaItems = project.items.length
    ? project.items
    : project.thumbnail
      ? [
          {
            ...project.thumbnail,
            caption: project.subtitle,
          },
        ]
      : [];

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <p>{project.year}</p>
        <h1>{project.title}</h1>
        <p>{project.tags?.join(", ")}</p>
      </header>

      <div className={styles.mediaStack}>
        {mediaItems.map((item, index) => (
          <MediaItem asset={item} key={item.id} priority={index === 0} videoThreshold={0.42} />
        ))}
      </div>
    </article>
  );
}
