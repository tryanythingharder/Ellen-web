import Link from "next/link";
import { primaryNavigation } from "@/data/navigation";
import { NavLink } from "./NavLink";
import styles from "./Header.module.scss";

type HeaderProps = {
  contactOpen: boolean;
  onContactToggle: () => void;
};

export function Header({ contactOpen, onContactToggle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <nav aria-label="Primary navigation" className={styles.nav}>
        <ul>
          <li className={styles.brandItem}>
            <Link aria-label="ELLEN Projects" className={`${styles.button} ${styles.brandButton}`} data-active href="/">
              <span>ELLEN</span>
              <span className={styles.projectLabel}>Projects</span>
            </Link>
          </li>
          {primaryNavigation.slice(1).map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} label={item.label} />
            </li>
          ))}
          <li>
            <button
              className={styles.button}
              data-active={contactOpen}
              onClick={onContactToggle}
              type="button"
            >
              <span>Contact</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
