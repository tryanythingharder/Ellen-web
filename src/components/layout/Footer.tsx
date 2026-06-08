import Link from "next/link";
import { legalNavigation } from "@/data/navigation";
import styles from "./Footer.module.scss";

type FooterProps = {
  visible?: boolean;
};

export function Footer({ visible = false }: FooterProps) {
  return (
    <footer className={styles.footer} data-visible={visible}>
      <nav aria-label="Legal navigation">
        {legalNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
