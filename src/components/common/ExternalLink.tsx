import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./ExternalLink.module.scss";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function ExternalLink({
  children,
  className,
  rel = "noreferrer",
  target = "_blank",
  ...props
}: ExternalLinkProps) {
  const classNames = [styles.link, className].filter(Boolean).join(" ");

  return (
    <a className={classNames} rel={rel} target={target} {...props}>
      <span>{children}</span>
    </a>
  );
}
