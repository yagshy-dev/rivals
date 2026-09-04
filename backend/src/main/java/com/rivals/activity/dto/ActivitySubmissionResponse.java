package com.rivals.activity.dto;

import com.rivals.activity.ActivitySubmission;
import com.rivals.activity.ActivityType;
import com.rivals.activity.SubmissionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ActivitySubmissionResponse(
        UUID id,
        UUID targetSquadId,
        ActivityType activityType,
        BigDecimal metricValue,
        SubmissionStatus status,
        BigDecimal pointsAwarded,
        Instant submittedAt) {

    public static ActivitySubmissionResponse from(ActivitySubmission submission) {
        return new ActivitySubmissionResponse(
                submission.getId(),
                submission.getTargetSquadId(),
                submission.getActivityType(),
                submission.getMetricValue(),
                submission.getStatus(),
                submission.getPointsAwarded(),
                submission.getSubmittedAt());
    }
}
