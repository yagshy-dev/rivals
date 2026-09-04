package com.rivals.activity;

import com.rivals.activity.dto.ActivitySubmissionResponse;
import com.rivals.activity.dto.PendingSubmissionResponse;
import com.rivals.common.NotFoundException;
import com.rivals.points.PointsEngine;
import com.rivals.storage.ScreenshotStorageService;
import com.rivals.user.Role;
import com.rivals.user.User;
import com.rivals.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ActivityService {

    private final ActivitySubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ActivitySubmissionValidator validator;
    private final ScreenshotStorageService storageService;
    private final PointsEngine pointsEngine;

    public ActivityService(ActivitySubmissionRepository submissionRepository, UserRepository userRepository,
            ActivitySubmissionValidator validator, ScreenshotStorageService storageService,
            PointsEngine pointsEngine) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.validator = validator;
        this.storageService = storageService;
        this.pointsEngine = pointsEngine;
    }

    /** FR-001, FR-002, FR-003, FR-047, FR-048. */
    @Transactional
    public ActivitySubmissionResponse submit(UUID userId, UUID targetSquadId, ActivityType activityType,
            BigDecimal metricValue, MultipartFile screenshot) {
        validator.validateMetricValue(metricValue);
        validator.validateTargetSquad(targetSquadId, activityType, userId);
        String screenshotRef = storageService.store(screenshot);
        ActivitySubmission submission = new ActivitySubmission(
                UUID.randomUUID(), userId, targetSquadId, activityType, metricValue, screenshotRef, Instant.now());
        submissionRepository.save(submission);
        return ActivitySubmissionResponse.from(submission);
    }

    /** FR-009. */
    public List<ActivitySubmissionResponse> getMine(UUID userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId).stream()
                .map(ActivitySubmissionResponse::from)
                .toList();
    }

    /** FR-004. */
    public List<PendingSubmissionResponse> getPending() {
        return submissionRepository.findByStatusOrderBySubmittedAtAsc(SubmissionStatus.PENDING).stream()
                .map(s -> PendingSubmissionResponse.from(s, displayNameOf(s.getUserId())))
                .toList();
    }

    /** FR-018, FR-057: only the submitting user or an admin may view the screenshot, and only
     * while it still exists — it is deleted the moment the submission is decided (FR-056). */
    public ScreenshotStorageService.StoredFile getScreenshot(UUID submissionId, UUID requesterId, Role requesterRole) {
        ActivitySubmission submission = findOrThrow(submissionId);
        boolean isOwner = submission.getUserId().equals(requesterId);
        boolean isAdmin = requesterRole == Role.ADMIN;
        if (!isOwner && !isAdmin || submission.getScreenshotRef() == null) {
            throw new NotFoundException("Screenshot not found");
        }
        return storageService.load(submission.getScreenshotRef());
    }

    /** FR-005, FR-006, FR-008, FR-019, FR-056. */
    @Transactional
    public ActivitySubmissionResponse approve(UUID submissionId, UUID adminId) {
        ActivitySubmission submission = findOrThrow(submissionId);
        BigDecimal points = pointsEngine.calculate(submission.getActivityType(), submission.getMetricValue());
        submission.approve(adminId, points, Instant.now());
        deleteScreenshot(submission);
        submissionRepository.save(submission);
        return ActivitySubmissionResponse.from(submission);
    }

    /** FR-005, FR-007, FR-008, FR-019, FR-056. */
    @Transactional
    public ActivitySubmissionResponse reject(UUID submissionId, UUID adminId) {
        ActivitySubmission submission = findOrThrow(submissionId);
        submission.reject(adminId, Instant.now());
        deleteScreenshot(submission);
        submissionRepository.save(submission);
        return ActivitySubmissionResponse.from(submission);
    }

    /** FR-056: a decided submission's screenshot has served its purpose and is not retained. */
    private void deleteScreenshot(ActivitySubmission submission) {
        storageService.delete(submission.getScreenshotRef());
        submission.clearScreenshotRef();
    }

    private ActivitySubmission findOrThrow(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found: " + submissionId));
    }

    private String displayNameOf(UUID userId) {
        return userRepository.findById(userId).map(User::getDisplayName).orElse("Unknown");
    }
}
