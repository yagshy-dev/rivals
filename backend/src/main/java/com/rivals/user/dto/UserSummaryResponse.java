package com.rivals.user.dto;

import com.rivals.user.User;
import java.util.UUID;

public record UserSummaryResponse(UUID id, String displayName) {

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(user.getId(), user.getDisplayName());
    }
}
