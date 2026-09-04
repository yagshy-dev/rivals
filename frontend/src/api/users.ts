import { apiGet, apiPost, apiPostForm, apiPut } from "./client";
import type {
  ChangePasswordRequest,
  PublicProfileResponse,
  UserResponse,
  UserSummaryResponse,
} from "../types";

/** FR-043: the global employee directory, usable by any authenticated user. */
export function searchUsers(search: string): Promise<UserSummaryResponse[]> {
  return apiGet<UserSummaryResponse[]>(`/users?search=${encodeURIComponent(search)}`);
}

/** FR-044, FR-045: public profile, with Squad-specific detail gated on a shared Squad. */
export function getUserProfile(id: string): Promise<PublicProfileResponse> {
  return apiGet<PublicProfileResponse>(`/users/${id}/profile`);
}

/** FR-049: update one's own personal quote (the photo is set separately, see `uploadMyPhoto`). */
export function updateMyQuote(quote: string): Promise<UserResponse> {
  return apiPut<UserResponse>("/users/me/profile", { quote });
}

/** FR-051: set/replace one's own profile photo via file upload, not a pasted URL. */
export function uploadMyPhoto(photo: File): Promise<UserResponse> {
  const form = new FormData();
  form.append("photo", photo);
  return apiPostForm<UserResponse>("/users/me/photo", form);
}

/** FR-052, FR-053, FR-054: current password is required to accept a new one. */
export function changeMyPassword(request: ChangePasswordRequest): Promise<void> {
  return apiPost<void>("/users/me/password", request);
}
