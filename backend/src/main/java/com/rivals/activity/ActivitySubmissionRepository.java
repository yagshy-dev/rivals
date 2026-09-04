package com.rivals.activity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivitySubmissionRepository extends JpaRepository<ActivitySubmission, UUID> {

    List<ActivitySubmission> findByUserIdOrderBySubmittedAtDesc(UUID userId);

    List<ActivitySubmission> findByStatusOrderBySubmittedAtAsc(SubmissionStatus status);

    /** A user's Global Average (FR-044) — the same total used by the Global leaderboard (FR-013). */
    @Query("SELECT COALESCE(SUM(s.pointsAwarded), 0) FROM ActivitySubmission s "
            + "WHERE s.userId = :userId AND s.status = 'APPROVED'")
    BigDecimal sumApprovedPointsByUserId(@Param("userId") UUID userId);

    /** FR-045: a user's Approved points within one specific shared Squad. */
    @Query("SELECT COALESCE(SUM(s.pointsAwarded), 0) FROM ActivitySubmission s "
            + "WHERE s.userId = :userId AND s.targetSquadId = :squadId AND s.status = 'APPROVED'")
    BigDecimal sumApprovedPointsByUserIdAndTargetSquadId(@Param("userId") UUID userId, @Param("squadId") UUID squadId);
}
