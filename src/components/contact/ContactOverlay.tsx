import { ExternalLink } from "@/components/common/ExternalLink";
import { contact } from "@/data/contact";
import styles from "./ContactOverlay.module.scss";

type ContactOverlayProps = {
  open: boolean;
};

export function ContactOverlay({ open }: ContactOverlayProps) {
  return (
    <section className={styles.overlay} data-open={open} aria-hidden={!open}>
      <nav className={styles.links} aria-label="Contact links">
        <ExternalLink className={styles.email} href={`mailto:${contact.email}`}>
          {contact.email}
        </ExternalLink>
        <ExternalLink href={contact.instagram}>Instagram</ExternalLink>
        <ExternalLink className={styles.address} href={contact.mapUrl}>
          {contact.address}
        </ExternalLink>
      </nav>
      <div className={styles.blur} />
    </section>
  );
}
