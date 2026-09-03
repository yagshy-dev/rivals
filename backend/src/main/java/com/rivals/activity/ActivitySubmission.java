package com.rivals.activity;

import com.rivals.common.ConflictException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * State machine (Constitution Principle IV, data-model.md): PENDING is the only state from which
 * a transition is possible, and points are set exclusively by {@link #approve}.
 */
@Entity
@Table(name = "activity_submissions")
public class ActivitySubmission {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "metric_value", nullable = false)
    private BigDecimal metricValue;

    @Column(name = "screenshot_ref", nullable = false)
    private String screenshotRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    @Column(name = "points_awarded")
    private BigDecimal pointsAwarded;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "reviewed_by_user_id")
    private UUID reviewedByUserId;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    protected ActivitySubmission() {
    }

    public ActivitySubmission(UUID id, UUID userId, ActivityType activityType, BigDecimal metricValue,
            String screenshotRef, Instant submittedAt) {
        this.id = id;
        this.userId = userId;
        this.activityType = activityType;
        this.metricValue = metricValue;
        this.screenshotRef = screenshotRef;
        this.status = SubmissionStatus.PENDING;
        this.submittedAt = submittedAt;
    }

    /** FR-006, FR-019: only a currently-PENDING submission can be approved. */
    public void approve(UUID reviewerId, BigDecimal points, Instant reviewedAt) {
        requirePending();
        this.status = SubmissionStatus.APPROVED;
        this.pointsAwarded = points;
        this.reviewedByUserId = reviewerId;
        this.reviewedAt = reviewedAt;
    }

    /** FR-007, FR-019: only a currently-PENDING submission can be rejected. */
    public void reject(UUID reviewerId, Instant reviewedAt) {
        requirePending();
        this.status = SubmissionStatus.REJECTED;
        this.reviewedByUserId = reviewerId;
        this.reviewedAt = reviewedAt;
    }

    private void requirePending() {
        if (this.status != SubmissionStatus.PENDING) {
            throw new ConflictException("Submission has already been decided");
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public BigDecimal getMetricValue() {
        return metricValue;
    }

    public String getScreenshotRef() {
        return screenshotRef;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public BigDecimal getPointsAwarded() {
        return pointsAwarded;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public UUID getReviewedByUserId() {
        return reviewedByUserId;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }
}
