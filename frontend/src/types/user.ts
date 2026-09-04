export interface UserSummaryResponse {
  id: string;
  displayName: string;
}

export interface SharedSquadActivity {
  squadId: string;
  squadName: string;
  pointsInSquad: number;
}

/** FR-044, FR-045: `sharedSquads` is empty unless the viewer shares a Squad with this profile. */
export interface PublicProfileResponse {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  quote: string | null;
  globalAverage: number;
  sharedSquads: SharedSquadActivity[];
}

/** FR-049, FR-055: only the quote is settable here — the photo is set via file upload (FR-051). */
export interface UpdateProfileRequest {
  quote: string | null;
}

/** FR-052, FR-053, FR-054: current password is required to accept a new one. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
