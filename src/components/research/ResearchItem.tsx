"use client";

import { motion } from "framer-motion";
import { revealGroupItem } from "@/components/common/RevealGroup";
import { MediaItem } from "@/components/media/MediaItem";
import type { ResearchEntry } from "@/types/content";
import styles from "./ResearchItem.module.scss";

type ResearchItemProps = {
  entry: ResearchEntry;
};

export function ResearchItem({ entry }: ResearchItemProps) {
  return (
    <motion.article
      className={styles.item}
      data-interaction={entry.interactionMode ?? "display"}
      variants={revealGroupItem}
    >
      <MediaItem asset={entry.media} />
      <div className={styles.meta}>
        <p>{entry.title ?? "Untitled"}</p>
        {entry.type ? <span>{entry.type}</span> : null}
      </div>
    </motion.article>
  );
}
