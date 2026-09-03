package com.rivals.squad.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateInvitationRequest(@NotNull(message = "must not be null") UUID invitedUserId) {
}
