import type { Notification, NotifyInput } from "./types";

/**
 * Framework-agnostic notification store.
 *
 * Why a module-level store instead of React context: notifications are triggered from
 * the TanStack Query `QueryCache`/`MutationCache` callbacks, which run *outside* the
 * React tree and have no access to hooks or context. A plain observable store lets both
 * that out-of-React code and the `<NotificationCenter/>` component talk to the same
 * state. The component subscribes via `useSyncExternalStore` (see NotificationCenter).
 */

const DEFAULT_DURATIONS: Record<Notification["kind"], number | null> = {
  success: 4000,
  info: 5000,
  error: null, // errors are sticky until dismissed
};

let notifications: Notification[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  // Replace the array reference so useSyncExternalStore detects the change.
  notifications = [...notifications];
  for (const listener of listeners) {
    listener();
  }
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `n_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const notificationStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): Notification[] {
    return notifications;
  },

  notify(input: NotifyInput): string {
    const id = createId();
    const durationMs = input.durationMs === undefined ? DEFAULT_DURATIONS[input.kind] : input.durationMs;

    notifications = [
      ...notifications,
      { id, kind: input.kind, message: input.message, durationMs, createdAt: Date.now() },
    ];
    emit();

    if (durationMs !== null) {
      timers.set(
        id,
        setTimeout(() => notificationStore.dismiss(id), durationMs)
      );
    }

    return id;
  },

  dismiss(id: string) {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    notifications = notifications.filter((item) => item.id !== id);
    emit();
  },

  clear() {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();
    notifications = [];
    emit();
  },
};

/** Convenience helpers used by the query layer and app code. */
export const notify = {
  success: (message: string, durationMs?: number | null) =>
    notificationStore.notify({ kind: "success", message, durationMs }),
  error: (message: string, durationMs?: number | null) =>
    notificationStore.notify({ kind: "error", message, durationMs }),
  info: (message: string, durationMs?: number | null) =>
    notificationStore.notify({ kind: "info", message, durationMs }),
};
