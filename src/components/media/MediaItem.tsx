import type { MediaAsset } from "@/types/content";
import { MediaImage } from "./MediaImage";
import { MediaPlaceholder } from "./MediaPlaceholder";
import { MediaVideo } from "./MediaVideo";
import styles from "./MediaItem.module.scss";

type MediaItemProps = {
  asset: MediaAsset;
  priority?: boolean;
  videoThreshold?: number;
};

export function MediaItem({
  asset,
  priority = false,
  videoThreshold,
}: MediaItemProps) {
  return (
    <div className={styles.mediaItem}>
      {asset.type === "image" && asset.src ? (
        <MediaImage
          alt={asset.alt}
          aspectRatio={asset.aspectRatio}
          priority={priority}
          src={asset.src}
        />
      ) : null}

      {asset.type === "video" && asset.src ? (
        <MediaVideo
          alt={asset.alt}
          aspectRatio={asset.aspectRatio}
          poster={asset.poster}
          src={asset.src}
          threshold={videoThreshold}
        />
      ) : null}

      {asset.type === "placeholder" ? (
        <MediaPlaceholder
          alt={asset.alt}
          aspectRatio={asset.aspectRatio}
          tone={asset.tone}
        />
      ) : null}

      {asset.caption ? <p className={styles.caption}>{asset.caption}</p> : null}
    </div>
  );
}
