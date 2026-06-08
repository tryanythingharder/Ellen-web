import styles from "./MediaPlaceholder.module.scss";

type MediaPlaceholderProps = {
  alt: string;
  aspectRatio?: string;
  tone?: "light" | "mid" | "dark";
};

export function MediaPlaceholder({
  alt,
  aspectRatio = "4 / 5",
  tone = "mid",
}: MediaPlaceholderProps) {
  return (
    <div
      aria-label={alt}
      className={styles.placeholder}
      data-tone={tone}
      role="img"
      style={{ aspectRatio }}
    >
      <span>Media pending</span>
    </div>
  );
}
