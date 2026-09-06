import type { ReactNode } from "react";
import { ActiveLink } from "@/shared/routing/ActiveLink";
import styles from "./ModuleNav.module.css";

export type ModuleNavItem = {
  href: string;
  label: ReactNode;
  /** Exact match for the active state (default false = prefix match). */
  exact?: boolean;
  testId?: string;
};

/**
 * The in-module tab strip — a row of `ActiveLink`s. Replaces the former global
 * `.module-links` list duplicated across every module. Owns the link/active styling and
 * feeds the hashed CSS-Module classes into `ActiveLink`'s existing className/activeClassName
 * props, so `ActiveLink` needs no change.
 */
export function ModuleNav({ items }: { items: ModuleNavItem[] }) {
  return (
    <ul className={styles.nav}>
      {items.map((item) => (
        <li key={item.href}>
          <ActiveLink
            href={item.href}
            exact={item.exact}
            testId={item.testId}
            className={styles.link}
            activeClassName={styles.active}
          >
            {item.label}
          </ActiveLink>
        </li>
      ))}
    </ul>
  );
}
