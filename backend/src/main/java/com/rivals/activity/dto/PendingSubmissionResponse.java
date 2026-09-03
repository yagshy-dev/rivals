package com.rivals.activity.dto;

import com.rivals.activity.ActivitySubmission;
import com.rivals.activity.ActivityType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PendingSubmissionResponse(
        UUID id,
        String submitterDisplayName,
        ActivityType activityType,
        BigDecimal metricValue,
        String screenshotUrl,
        Instant submittedAt) {

    public static PendingSubmissionResponse from(ActivitySubmission submission, String submitterDisplayName) {
        return new PendingSubmissionResponse(
                submission.getId(),
                submitterDisplayName,
                submission.getActivityType(),
                submission.getMetricValue(),
                "/api/activities/" + submission.getId() + "/screenshot",
                submission.getSubmittedAt());
    }
}
