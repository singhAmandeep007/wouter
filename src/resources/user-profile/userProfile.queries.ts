import { queryOptions } from "@tanstack/react-query";
import { userProfileKeys } from "./userProfile.keys";
import { userProfileService } from "./userProfile.service";

export const userProfileQueries = {
  // Singleton "me" resource — the scope root key is the identity.
  profile: () =>
    queryOptions({
      queryKey: userProfileKeys.all,
      queryFn: () => userProfileService.get(),
      meta: { errorMessage: "Failed to load profile" },
    }),
};
