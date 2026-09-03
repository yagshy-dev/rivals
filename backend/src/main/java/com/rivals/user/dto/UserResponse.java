package com.rivals.user.dto;

import com.rivals.user.AppUserPrincipal;
import com.rivals.user.Role;
import java.util.UUID;

public record UserResponse(UUID userId, String displayName, Role role) {

    public static UserResponse from(AppUserPrincipal principal) {
        return new UserResponse(principal.getId(), principal.getDisplayName(), principal.getRole());
    }
}
