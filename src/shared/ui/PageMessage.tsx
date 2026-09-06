import type { ReactNode } from "react";
import styles from "./PageMessage.module.css";

type PageMessageProps = {
  children: ReactNode;
  /** "info" for loading/neutral text (role=status), "error" for failures (role=alert). */
  tone?: "info" | "error";
  testId?: string;
};

/**
 * DRYs the repeated one-line "Loading…" / "Failed to load…" messages that every module used
 * to hand-roll as a bare `<p>`. Also standardizes the a11y role (status vs alert) and gives
 * a testid hook for assertions.
 */
export function PageMessage({ children, tone = "info", testId }: PageMessageProps) {
  return (
    <p
      className={tone === "error" ? styles.error : styles.info}
      role={tone === "error" ? "alert" : "status"}
      data-testid={testId}
    >
      {children}
    </p>
  );
}
