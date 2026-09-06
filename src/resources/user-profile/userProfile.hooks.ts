import { useQueryClient } from "@tanstack/react-query";
import { type AppQueryOverrides, useAppMutation, useAppQuery } from "@/shared/query";
import { userProfileKeys } from "./userProfile.keys";
import { userProfileQueries } from "./userProfile.queries";
import { userProfileService } from "./userProfile.service";
import type { UpdateUserProfileInput, UserProfile } from "./userProfile.types";

export function useProfile(overrides?: AppQueryOverrides<UserProfile>) {
  return useAppQuery(userProfileQueries.profile(), overrides);
}

/**
 * Mutation hook demonstrating the full write path:
 * - `meta.successMessage` / `meta.errorMessage` drive the global toast (MutationCache).
 * - `onSuccess` writes the server response straight into the profile cache
 *   (`setQueryData`), so observers update instantly with no refetch round-trip.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (input: UpdateUserProfileInput) => userProfileService.update(input),
    meta: {
      successMessage: "Profile updated",
      errorMessage: "Failed to update profile",
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(userProfileKeys.all, updated);
    },
  });
}
