package com.rivals.squad.dto;

import com.rivals.squad.Squad;
import com.rivals.squad.SquadRole;
import java.util.UUID;

public record SquadSummaryResponse(
        UUID id, String name, long memberCount, boolean isCurrentUserMember, SquadRole currentUserRole) {

    public static SquadSummaryResponse of(
            Squad squad, long memberCount, boolean isCurrentUserMember, SquadRole currentUserRole) {
        return new SquadSummaryResponse(
                squad.getId(), squad.getName(), memberCount, isCurrentUserMember, currentUserRole);
    }
}
