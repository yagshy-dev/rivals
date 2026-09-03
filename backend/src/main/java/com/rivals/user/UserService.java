package com.rivals.user;

import com.rivals.common.OffsetLimitPageable;
import com.rivals.common.ValidationException;
import com.rivals.user.dto.UserSummaryResponse;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
