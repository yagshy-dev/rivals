package com.rivals.activity;

import com.rivals.activity.dto.ActivitySubmissionResponse;
import com.rivals.activity.dto.PendingSubmissionResponse;
import com.rivals.storage.ScreenshotStorageService;
import com.rivals.user.AppUserPrincipal;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Activity submission endpoints (contracts/activities.md) — covers User Story 1 and 2. */
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ActivitySubmissionResponse> submit(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam UUID targetSquadId,
            @RequestParam ActivityType activityType,
            @RequestParam BigDecimal metricValue,
            @RequestParam MultipartFile screenshot) {
        ActivitySubmissionResponse response =
                activityService.submit(principal.getId(), targetSquadId, activityType, metricValue, screenshot);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/mine")
    public List<ActivitySubmissionResponse> mine(@AuthenticationPrincipal AppUserPrincipal principal) {
        return activityService.getMine(principal.getId());
    }

    @GetMapping("/pending")
    public List<PendingSubmissionResponse> pending() {
        return activityService.getPending();
    }

    @GetMapping("/{id}/screenshot")
    public ResponseEntity<byte[]> screenshot(@AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable UUID id) {
        ScreenshotStorageService.StoredFile file =
                activityService.getScreenshot(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, file.contentType())
                .body(file.content());
    }

    @PostMapping("/{id}/approve")
    public ActivitySubmissionResponse approve(@AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable UUID id) {
        return activityService.approve(id, principal.getId());
    }

    @PostMapping("/{id}/reject")
    public ActivitySubmissionResponse reject(@AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable UUID id) {
        return activityService.reject(id, principal.getId());
    }
}
