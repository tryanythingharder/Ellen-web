"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import headerStyles from "./Header.module.scss";

type NavLinkProps = ComponentProps<typeof Link> & {
  label: string;
};

export function NavLink({ href, label, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const hrefString = href.toString();
  const isActive =
    hrefString === "/" ? pathname === "/" : pathname.startsWith(hrefString);
  const classNames = [headerStyles.button, className].filter(Boolean).join(" ");

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={classNames}
      data-active={isActive}
      href={href}
      {...props}
    >
      <span>{label}</span>
    </Link>
  );
}
