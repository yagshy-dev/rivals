package com.rivals.user;

import com.rivals.storage.ScreenshotStorageService;
import com.rivals.user.dto.ChangePasswordRequest;
import com.rivals.user.dto.PublicProfileResponse;
import com.rivals.user.dto.UpdateProfileRequest;
import com.rivals.user.dto.UserResponse;
import com.rivals.user.dto.UserSummaryResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Global employee directory search, public profiles, and Account Settings (contracts/users.md) —
 * covers User Story 4 (Manager invite picker), User Story 7 (system-wide search, FR-043–FR-045),
 * and User Story 8 (Account Settings, FR-049–FR-055).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserSummaryResponse> search(
            @RequestParam String search,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        return userService.search(search, limit, offset);
    }

    @GetMapping("/{id}/profile")
    public PublicProfileResponse profile(
            @AuthenticationPrincipal AppUserPrincipal principal, @PathVariable UUID id) {
        return userService.getProfile(id, principal.getId());
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> photo(@PathVariable UUID id) {
        ScreenshotStorageService.StoredFile file = userService.getPhoto(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, file.contentType())
                .body(file.content());
    }

    @PutMapping("/me/profile")
    public UserResponse updateMyProfile(
            @AuthenticationPrincipal AppUserPrincipal principal, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateMyQuote(principal.getId(), request.quote());
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse uploadMyPhoto(
            @AuthenticationPrincipal AppUserPrincipal principal, @RequestParam MultipartFile photo) {
        return userService.updateMyPhoto(principal.getId(), photo);
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(
            @AuthenticationPrincipal AppUserPrincipal principal, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
