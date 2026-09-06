import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  /** Extra classes merged after the base card class. */
  className?: string;
  testId?: string;
};

/**
 * The panel every module renders its content in. Replaces the former global `.module-card`
 * class (and the per-module descendant CSS that styled it) — so the card's look lives in
 * exactly one place (Card.module.css) instead of being reused via cross-file selectors.
 */
export function Card({ children, className, testId }: CardProps) {
  return (
    <section
      className={cx(styles.card, className)}
      data-testid={testId}
    >
      {children}
    </section>
  );
}
