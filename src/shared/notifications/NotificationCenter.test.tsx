import { afterEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationCenter } from "./NotificationCenter";
import { notificationStore, notify } from "./notificationStore";

// Wrapped in act(): this file-local afterEach runs before the global cleanup() (afterEach
// hooks run LIFO), so clear() emits a store update while <NotificationCenter/> is still
// mounted — that re-render must be inside act() to avoid a warning.
afterEach(() => act(() => notificationStore.clear()));

// The store lives outside React, so mutations must be wrapped in act() to flush the
// useSyncExternalStore-driven re-render before assertions.
function pushNotification(fn: () => void) {
  act(fn);
}

describe("NotificationCenter", () => {
  it("renders nothing when there are no notifications", () => {
    const { container } = render(<NotificationCenter />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders active notifications from the store with the right kind", () => {
    render(<NotificationCenter />);
    pushNotification(() => notify.success("It worked"));

    const toast = screen.getByTestId("notification-success");
    expect(toast).toHaveTextContent("It worked");
  });

  it("uses role=alert for errors and role=status otherwise", () => {
    render(<NotificationCenter />);
    pushNotification(() => {
      notify.error("Broken");
      notify.info("Heads up");
    });

    expect(screen.getByTestId("notification-error")).toHaveAttribute("role", "alert");
    expect(screen.getByTestId("notification-info")).toHaveAttribute("role", "status");
  });

  it("removes a notification when its dismiss button is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    pushNotification(() => notify.error("Dismiss me"));

    const toast = screen.getByTestId("notification-error");
    await user.click(within(toast).getByRole("button", { name: /dismiss/i }));

    expect(screen.queryByTestId("notification-error")).not.toBeInTheDocument();
  });
});
