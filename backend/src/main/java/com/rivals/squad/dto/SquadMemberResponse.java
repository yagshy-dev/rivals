package com.rivals.squad.dto;

import com.rivals.squad.SquadMembership;
import com.rivals.squad.SquadRole;
import java.time.Instant;
import java.util.UUID;

public record SquadMemberResponse(UUID userId, String displayName, SquadRole role, Instant joinedAt) {

    public static SquadMemberResponse of(SquadMembership membership, String displayName) {
        return new SquadMemberResponse(
                membership.getUserId(), displayName, membership.getRole(), membership.getJoinedAt());
    }
}
