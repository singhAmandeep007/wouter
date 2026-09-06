import type { ReactNode } from "react";
import styles from "./MetricGrid.module.css";

/** Responsive grid of metric tiles (used by the enterprise KPI dashboard). */
export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

/** A single labelled metric. */
export function MetricTile({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
    </div>
  );
}
