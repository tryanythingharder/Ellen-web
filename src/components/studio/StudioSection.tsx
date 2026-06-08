import { Reveal } from "@/components/common/Reveal";
import { MediaItem } from "@/components/media/MediaItem";
import type { MediaAsset } from "@/types/content";
import { StudioList } from "./StudioList";
import styles from "./StudioSection.module.scss";

type StudioSectionProps = {
  title: string;
  items?: string[];
  children?: React.ReactNode;
  media?: MediaAsset;
};

export function StudioSection({
  title,
  items,
  children,
  media,
}: StudioSectionProps) {
  return (
    <Reveal className={styles.section} threshold={0.14}>
      <section>
        <h2>{title}</h2>
        <div className={styles.body}>
          {children}
          {items ? <StudioList items={items} /> : null}
          {media ? <MediaItem asset={media} /> : null}
        </div>
      </section>
    </Reveal>
  );
}
