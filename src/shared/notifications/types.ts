export type NotificationKind = "success" | "error" | "info";

export type Notification = {
  id: string;
  kind: NotificationKind;
  message: string;
  /** Auto-dismiss delay in ms. `null` keeps it until dismissed (used for errors). */
  durationMs: number | null;
  createdAt: number;
};

export type NotifyInput = {
  kind: NotificationKind;
  message: string;
  durationMs?: number | null;
};
