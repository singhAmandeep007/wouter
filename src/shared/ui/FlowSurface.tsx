import type { ReactNode } from "react";
import styles from "./FlowSurface.module.css";

/**
 * Bordered, fixed-height container for a React Flow diagram. Unifies the two near-identical
 * flow-surface styles that used to live in enterprise-flow.css and live-order-flow.css.
 */
export function FlowSurface({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <div
      className={styles.surface}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
