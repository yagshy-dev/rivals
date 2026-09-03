package com.rivals.points;

import com.rivals.activity.ActivityType;
import java.math.BigDecimal;

/** Fixed scoring rule per activity type (spec.md FR-006, data-model.md). */
public enum ActivityPointRate {
    RUNNING(ActivityType.RUNNING, BigDecimal.valueOf(10)),
    CYCLING(ActivityType.CYCLING, BigDecimal.valueOf(4)),
    SWIMMING(ActivityType.SWIMMING, BigDecimal.valueOf(20)),
    YOGA(ActivityType.YOGA, BigDecimal.valueOf(1));

    private final ActivityType activityType;
    private final BigDecimal pointsPerUnit;

    ActivityPointRate(ActivityType activityType, BigDecimal pointsPerUnit) {
        this.activityType = activityType;
        this.pointsPerUnit = pointsPerUnit;
    }

    public static BigDecimal pointsPerUnitFor(ActivityType type) {
        for (ActivityPointRate rate : values()) {
            if (rate.activityType == type) {
                return rate.pointsPerUnit;
            }
        }
        throw new IllegalArgumentException("Unknown activity type: " + type);
    }
}
