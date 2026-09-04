package com.rivals.user;

import com.rivals.activity.ActivitySubmissionRepository;
import com.rivals.common.ConflictException;
import com.rivals.common.NotFoundException;
import com.rivals.common.OffsetLimitPageable;
import com.rivals.common.UnauthorizedException;
import com.rivals.common.ValidationException;
import com.rivals.squad.Squad;
import com.rivals.squad.SquadMembership;
import com.rivals.squad.SquadMembershipRepository;
import com.rivals.squad.SquadRepository;
import com.rivals.storage.ScreenshotStorageService;
import com.rivals.user.dto.PublicProfileResponse;
import com.rivals.user.dto.UserResponse;
import com.rivals.user.dto.UserSummaryResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SquadMembershipRepository membershipRepository;
    private final SquadRepository squadRepository;
    private final ActivitySubmissionRepository submissionRepository;
    private final ScreenshotStorageService storageService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            SquadMembershipRepository membershipRepository, SquadRepository squadRepository,
            ActivitySubmissionRepository submissionRepository, ScreenshotStorageService storageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.membershipRepository = membershipRepository;
        this.squadRepository = squadRepository;
        this.submissionRepository = submissionRepository;
        this.storageService = storageService;
    }

    /**
     * FR-036, FR-038, FR-039, FR-040: public self-registration. Email uniqueness is
     * case-insensitive (FR-038); the password is hashed before storage and never kept as
     * plaintext (FR-039); every registered account is assigned the standard employee role,
     * never Admin (FR-040).
     */
    @Transactional
    public UserResponse register(String email, String displayName, String rawPassword) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ConflictException("An account with email '" + email + "' already exists");
        }
        User user = new User(
                UUID.randomUUID(), displayName, email,
                passwordEncoder.encode(rawPassword), Role.USER, Instant.now());
        userRepository.save(user);
        return UserResponse.from(new AppUserPrincipal(user));
    }

    /** FR-023: employee-directory search backing the invite picker; a blank query is a 400. */
    public List<UserSummaryResponse> search(String query, Integer limit, Integer offset) {
        if (query == null || query.isBlank()) {
            throw new ValidationException("search must not be blank");
        }
        int safeLimit = clampLimit(limit);
        long safeOffset = offset == null || offset < 0 ? 0 : offset;
        return userRepository
                .findByDisplayNameContainingIgnoreCase(
                        query, OffsetLimitPageable.of(safeOffset, safeLimit, Sort.by("displayName")))
                .stream()
                .map(UserSummaryResponse::from)
                .toList();
    }

    /**
     * FR-043, FR-044, FR-045: any authenticated user may view any other user's public profile.
     * {@code sharedSquads} is populated only for Squads the requester and the profile's owner both
     * currently belong to; when the requester shares no Squad with this user, it is empty and only
     * the public fields (photo, quote, Global Average) carry meaning.
     */
    public PublicProfileResponse getProfile(UUID targetUserId, UUID requesterId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + targetUserId));
        BigDecimal globalAverage = submissionRepository.sumApprovedPointsByUserId(targetUserId);

        Set<UUID> requesterSquadIds = membershipRepository.findByUserId(requesterId).stream()
                .map(SquadMembership::getSquadId)
                .collect(Collectors.toSet());
        List<PublicProfileResponse.SharedSquadActivity> sharedSquads =
                membershipRepository.findByUserId(targetUserId).stream()
                        .filter(m -> requesterSquadIds.contains(m.getSquadId()))
                        .map(m -> {
                            Squad squad = squadRepository.findById(m.getSquadId()).orElse(null);
                            BigDecimal pointsInSquad = submissionRepository
                                    .sumApprovedPointsByUserIdAndTargetSquadId(targetUserId, m.getSquadId());
                            return new PublicProfileResponse.SharedSquadActivity(
                                    m.getSquadId(), squad == null ? "Unknown" : squad.getName(), pointsInSquad);
                        })
                        .toList();

        return new PublicProfileResponse(
                target.getId(), target.getDisplayName(), photoUrlOf(target), target.getQuote(),
                globalAverage, sharedSquads);
    }

    /** FR-049: a user may update their own personal quote. */
    @Transactional
    public UserResponse updateMyQuote(UUID userId, String quote) {
        User user = findOrThrow(userId);
        user.updateQuote(quote);
        userRepository.save(user);
        return UserResponse.from(new AppUserPrincipal(user));
    }

    /** FR-051: a user may set/replace their own profile photo by uploading a new file. */
    @Transactional
    public UserResponse updateMyPhoto(UUID userId, MultipartFile photo) {
        User user = findOrThrow(userId);
        user.updatePhotoRef(storageService.store(photo));
        userRepository.save(user);
        return UserResponse.from(new AppUserPrincipal(user));
    }

    /** Serves a user's uploaded profile photo; public within the authenticated app (FR-044). */
    public ScreenshotStorageService.StoredFile getPhoto(UUID userId) {
        User user = findOrThrow(userId);
        if (user.getPhotoRef() == null) {
            throw new NotFoundException("No profile photo set for user: " + userId);
        }
        return storageService.load(user.getPhotoRef());
    }

    /** FR-052, FR-053, FR-054: re-authenticates with the current password before accepting a new one. */
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = findOrThrow(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.changePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User findOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }

    private static String photoUrlOf(User user) {
        return user.getPhotoRef() == null ? null : "/api/users/" + user.getId() + "/photo";
    }

    private static int clampLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
