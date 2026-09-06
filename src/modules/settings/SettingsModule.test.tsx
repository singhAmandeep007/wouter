import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { notificationStore } from "@/shared/notifications";
import SettingsModule from "./SettingsModule";

afterEach(() => notificationStore.clear());

describe("SettingsModule profile route", () => {
  it("loads the profile and submits an update, emitting a success notification", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModule />, { route: "/settings/profile" });

    const input = await screen.findByTestId("profile-name-input");
    await user.clear(input);
    await user.type(input, "New Display Name");
    await user.click(screen.getByTestId("profile-save-button"));

    await waitFor(() =>
      expect(
        notificationStore.getSnapshot().some((n) => n.kind === "success" && n.message === "Profile updated")
      ).toBe(true)
    );
  });

  it("renders the payment route list", async () => {
    renderWithProviders(<SettingsModule />, { route: "/settings/payment" });
    expect(await screen.findByTestId("settings-payment-page")).toBeInTheDocument();
  });
});
