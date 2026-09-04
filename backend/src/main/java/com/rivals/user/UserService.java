package com.rivals.user;

import com.rivals.common.ConflictException;
import com.rivals.common.OffsetLimitPageable;
import com.rivals.common.ValidationException;
import com.rivals.user.dto.UserResponse;
import com.rivals.user.dto.UserSummaryResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

    private static int clampLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
