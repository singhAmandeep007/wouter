import { useSyncExternalStore } from "react";
import { cx } from "@/shared/ui";
import { notificationStore } from "./notificationStore";
import styles from "./notifications.module.css";

/**
 * Renders the notification stack. It is a pure subscriber: `useSyncExternalStore` binds
 * React to the module-level store (the same store the query cache callbacks push into),
 * so the component stays a leaf with no business logic. Auto-dismiss timers live in the
 * store, so notifications behave correctly even before/after this mounts.
 */
export function NotificationCenter() {
  const notifications = useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.center}
      role="region"
      aria-label="Notifications"
      data-testid="notification-center"
    >
      {notifications.map((item) => (
        <div
          key={item.id}
          className={cx(styles.item, styles[item.kind])}
          role={item.kind === "error" ? "alert" : "status"}
          data-testid={`notification-${item.kind}`}
        >
          <span className={styles.message}>{item.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            aria-label="Dismiss notification"
            onClick={() => notificationStore.dismiss(item.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
