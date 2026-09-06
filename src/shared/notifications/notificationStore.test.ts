import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationStore, notify } from "./notificationStore";

describe("notificationStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    notificationStore.clear();
    vi.useRealTimers();
  });

  it("adds a notification and exposes it via the snapshot", () => {
    notify.info("hello");
    const snapshot = notificationStore.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toMatchObject({ kind: "info", message: "hello" });
  });

  it("returns a NEW snapshot reference on change (so useSyncExternalStore re-renders)", () => {
    const before = notificationStore.getSnapshot();
    notify.success("ok");
    const after = notificationStore.getSnapshot();
    expect(after).not.toBe(before);
  });

  it("notifies subscribers on add and dismiss", () => {
    const listener = vi.fn();
    const unsubscribe = notificationStore.subscribe(listener);

    const id = notify.error("bad");
    expect(listener).toHaveBeenCalledTimes(1);

    notificationStore.dismiss(id);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    notify.info("ignored");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("auto-dismisses success toasts after the default duration", () => {
    notify.success("saved");
    expect(notificationStore.getSnapshot()).toHaveLength(1);

    vi.advanceTimersByTime(4000);
    expect(notificationStore.getSnapshot()).toHaveLength(0);
  });

  it("keeps error toasts sticky (no auto-dismiss)", () => {
    notify.error("permanent");
    vi.advanceTimersByTime(60_000);
    expect(notificationStore.getSnapshot()).toHaveLength(1);
  });

  it("honors an explicit duration override", () => {
    notify.error("temporary", 1000);
    vi.advanceTimersByTime(999);
    expect(notificationStore.getSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(notificationStore.getSnapshot()).toHaveLength(0);
  });

  it("clear() removes everything and cancels pending timers", () => {
    notify.success("a");
    notify.info("b");
    expect(notificationStore.getSnapshot()).toHaveLength(2);

    notificationStore.clear();
    expect(notificationStore.getSnapshot()).toHaveLength(0);

    // Advancing time must not resurrect or error on cleared timers.
    vi.advanceTimersByTime(10_000);
    expect(notificationStore.getSnapshot()).toHaveLength(0);
  });
});
