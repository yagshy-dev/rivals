package com.rivals.leaderboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Read-time aggregate queries (research.md #5) over Approved submissions and current squad
 * membership — no denormalized counters. A plain JdbcTemplate is used rather than a Spring Data
 * repository because these are cross-entity aggregates with no single owning entity.
 */
@Repository
public class LeaderboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public LeaderboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** FR-013, FR-017 tie-break: all users, zero-point users included, ordered total desc/name asc. */
    public List<UnrankedIndividualRow> findIndividualLeaderboard(int limit, long offset) {
        String sql = """
                SELECT u.id AS user_id, u.display_name AS display_name,
                       COALESCE(SUM(s.points_awarded), 0) AS total_points
                FROM users u
                LEFT JOIN activity_submissions s ON s.user_id = u.id AND s.status = 'APPROVED'
                GROUP BY u.id, u.display_name
                ORDER BY total_points DESC, u.display_name ASC
                LIMIT ? OFFSET ?
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new UnrankedIndividualRow(
                UUID.fromString(rs.getString("user_id")),
                rs.getString("display_name"),
                rs.getBigDecimal("total_points")), limit, offset);
    }

    /**
     * FR-014, FR-015, FR-017 tie-break, research.md #7 zero-member handling: a squad's total is
     * the sum of its current members' approved points, average is total / member count (0 when
     * there are no members, which also naturally sorts it last in an average-descending order).
     */
    public List<UnrankedSquadRow> findSquadLeaderboard(String orderColumn, int limit, long offset) {
        String sql = """
                SELECT sq.id AS squad_id, sq.name AS name, COUNT(sm.user_id) AS member_count,
                       COALESCE(SUM(member_points.total_points), 0) AS total_points,
                       CASE WHEN COUNT(sm.user_id) = 0 THEN 0
                            ELSE COALESCE(SUM(member_points.total_points), 0) / COUNT(sm.user_id)
                       END AS average_points
                FROM squads sq
                LEFT JOIN squad_memberships sm ON sm.squad_id = sq.id
                LEFT JOIN (
                    SELECT user_id, SUM(points_awarded) AS total_points
                    FROM activity_submissions
                    WHERE status = 'APPROVED'
                    GROUP BY user_id
                ) member_points ON member_points.user_id = sm.user_id
                GROUP BY sq.id, sq.name
                ORDER BY %s DESC, sq.name ASC
                LIMIT ? OFFSET ?
                """.formatted(orderColumn);
        return jdbcTemplate.query(sql, (rs, rowNum) -> new UnrankedSquadRow(
                UUID.fromString(rs.getString("squad_id")),
                rs.getString("name"),
                rs.getLong("member_count"),
                rs.getBigDecimal("total_points"),
                rs.getBigDecimal("average_points")), limit, offset);
    }

    public record UnrankedIndividualRow(UUID userId, String displayName, BigDecimal totalPoints) {
    }

    public record UnrankedSquadRow(
            UUID squadId, String name, long memberCount, BigDecimal totalPoints, BigDecimal averagePoints) {
    }
}
