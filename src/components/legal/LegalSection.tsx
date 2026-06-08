import type { LegalPageData } from "@/types/content";
import styles from "./LegalSection.module.scss";

type LegalSectionProps = LegalPageData["sections"][number];

export function LegalSection({
  heading,
  paragraphs,
  bullets,
}: LegalSectionProps) {
  return (
    <section className={styles.section}>
      <h2>{heading}</h2>
      <div className={styles.copy}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {bullets ? (
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
