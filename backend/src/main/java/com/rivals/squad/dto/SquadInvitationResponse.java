package com.rivals.squad.dto;

import com.rivals.squad.InvitationStatus;
import com.rivals.squad.SquadInvitation;
import java.time.Instant;
import java.util.UUID;

public record SquadInvitationResponse(
        UUID id,
        UUID squadId,
        String squadName,
        UUID invitedUserId,
        UUID invitedByUserId,
        String invitedByDisplayName,
        InvitationStatus status,
        Instant createdAt,
        Instant decidedAt) {

    public static SquadInvitationResponse of(
            SquadInvitation invitation, String squadName, String invitedByDisplayName) {
        return new SquadInvitationResponse(
                invitation.getId(),
                invitation.getSquadId(),
                squadName,
                invitation.getInvitedUserId(),
                invitation.getInvitedByUserId(),
                invitedByDisplayName,
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getDecidedAt());
    }
}
