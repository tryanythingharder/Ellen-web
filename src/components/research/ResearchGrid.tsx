import { RevealGroup } from "@/components/common/RevealGroup";
import type { ResearchEntry } from "@/types/content";
import { ResearchItem } from "./ResearchItem";
import styles from "./ResearchGrid.module.scss";

type ResearchGridProps = {
  entries: ResearchEntry[];
};

export function ResearchGrid({ entries }: ResearchGridProps) {
  return (
    <RevealGroup className={styles.grid} threshold={0.08}>
      {entries.map((entry) => (
        <ResearchItem entry={entry} key={entry.id} />
      ))}
    </RevealGroup>
  );
}
