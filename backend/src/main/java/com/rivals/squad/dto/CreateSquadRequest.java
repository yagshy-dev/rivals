package com.rivals.squad.dto;

import com.rivals.activity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

/**
 * FR-011, FR-046: {@code allowedActivityTypes} is optional — a squad with no explicit selection
 * (null or empty) defaults to allowing all four activity types.
 */
public record CreateSquadRequest(
        @NotBlank(message = "must not be blank")
        @Size(max = 100, message = "must be at most 100 characters")
        String name,
        Set<ActivityType> allowedActivityTypes) {
}
