import styles from "./StudioList.module.scss";

type StudioListProps = {
  items: string[];
};

export function StudioList({ items }: StudioListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
