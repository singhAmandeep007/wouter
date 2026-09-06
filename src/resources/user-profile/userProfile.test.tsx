import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { notificationStore } from "@/shared/notifications";
import { createQueryWrapper } from "@/test/test-utils";
import { server } from "@/test/server";
import { userProfileService } from "./userProfile.service";
import { userProfileKeys } from "./userProfile.keys";
import { useProfile, useUpdateProfile } from "./userProfile.hooks";

afterEach(() => notificationStore.clear());

describe("UserProfileService", () => {
  it("gets and updates the profile", async () => {
    const profile = await userProfileService.get();
    expect(profile).toHaveProperty("email");

    const updated = await userProfileService.update({ name: "Renamed" });
    expect(updated.name).toBe("Renamed");
  });
});

describe("useProfile / useUpdateProfile", () => {
  it("loads the profile", async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBeTruthy();
  });

  it("updates the profile, writes the response into cache, and fires a success toast", async () => {
    const { wrapper, queryClient } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await waitFor(() => expect(result.current.isIdle).toBe(true));
    result.current.mutate({ name: "Cache Name" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // onSuccess writes straight into the profile cache (no refetch).
    expect(queryClient.getQueryData(userProfileKeys.all)).toMatchObject({ name: "Cache Name" });
    // MutationCache emits the success toast from meta.successMessage.
    await waitFor(() =>
      expect(notificationStore.getSnapshot().some((n) => n.kind === "success" && n.message === "Profile updated")).toBe(
        true
      )
    );
  });

  it("fires an error toast when the update fails", async () => {
    server.use(http.put("/api/settings/profile", () => HttpResponse.json({ message: "nope" }, { status: 500 })));
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({ name: "Will Fail" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(
        notificationStore.getSnapshot().some((n) => n.kind === "error" && n.message === "Failed to update profile")
      ).toBe(true)
    );
  });
});
