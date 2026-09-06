import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { UserProfile as userProfileSchema } from "@/shared/api/generated/zod";
import type { UpdateUserProfileInput, UserProfile } from "./userProfile.types";

export class UserProfileService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  get(): Promise<UserProfile> {
    return unwrap(this.client.GET("/api/settings/profile"), userProfileSchema);
  }

  update(input: UpdateUserProfileInput): Promise<UserProfile> {
    return unwrap(this.client.PUT("/api/settings/profile", { body: input }), userProfileSchema);
  }
}

export const userProfileService = new UserProfileService();
