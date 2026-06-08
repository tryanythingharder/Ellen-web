import Image from "next/image";
import styles from "./MediaImage.module.scss";

type MediaImageProps = {
  src: string;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
};

export function MediaImage({
  src,
  alt,
  aspectRatio = "4 / 5",
  priority = false,
}: MediaImageProps) {
  return (
    <figure className={styles.imageFrame} style={{ aspectRatio }}>
      <Image
        alt={alt}
        className={styles.image}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 82vw"
        src={src}
      />
    </figure>
  );
}
