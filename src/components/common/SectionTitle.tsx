import styles from "./SectionTitle.module.scss";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  summary?: string;
};

export function SectionTitle({ eyebrow, title, summary }: SectionTitleProps) {
  return (
    <header className={styles.titleBlock}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1 className={styles.title}>{title}</h1>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
    </header>
  );
}
