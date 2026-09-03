package com.rivals.squad.dto;

import com.rivals.squad.Squad;
import java.util.UUID;

public record SquadSummaryResponse(UUID id, String name, long memberCount, boolean isCurrentUserMember) {

    public static SquadSummaryResponse of(Squad squad, long memberCount, boolean isCurrentUserMember) {
        return new SquadSummaryResponse(squad.getId(), squad.getName(), memberCount, isCurrentUserMember);
    }
}
