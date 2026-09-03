package com.rivals.points;

import com.rivals.activity.ActivityType;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

/**
 * Constitution Principle IV (Human-in-the-Loop Approval, Non-Negotiable): this is the only
 * component that computes points, and it is invoked exclusively from the admin-approval
 * transition — never from submission creation.
 */
@Service
public class PointsEngine {

    /** rate x metricValue, kept fractional and never rounded (spec Clarifications 2026-09-03). */
    public BigDecimal calculate(ActivityType activityType, BigDecimal metricValue) {
        BigDecimal ratePerUnit = ActivityPointRate.pointsPerUnitFor(activityType);
        return metricValue.multiply(ratePerUnit);
    }
}
