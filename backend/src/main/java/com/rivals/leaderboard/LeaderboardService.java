package com.rivals.leaderboard;

import com.rivals.common.ErrorResponse;
import com.rivals.common.ValidationException;
import com.rivals.leaderboard.dto.IndividualLeaderboardRow;
import com.rivals.leaderboard.dto.SquadLeaderboardRow;
import java.util.List;

@org.springframework.stereotype.Service
public class LeaderboardService {

    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 200;

    private final LeaderboardRepository repository;

    public LeaderboardService(LeaderboardRepository repository) {
        this.repository = repository;
    }

    public List<IndividualLeaderboardRow> individualLeaderboard(Integer limit, Integer offset) {
        int safeLimit = clampLimit(limit);
        long safeOffset = safeOffset(offset);
        int startRank = (int) safeOffset + 1;

        List<LeaderboardRepository.UnrankedIndividualRow> rows =
                repository.findIndividualLeaderboard(safeLimit, safeOffset);

        return rankIndividual(rows, startRank);
    }

    public List<SquadLeaderboardRow> squadLeaderboard(String sortBy, Integer limit, Integer offset) {
        String orderColumn = orderColumnFor(sortBy);
        int safeLimit = clampLimit(limit);
        long safeOffset = safeOffset(offset);
        int startRank = (int) safeOffset + 1;

        List<LeaderboardRepository.UnrankedSquadRow> rows =
                repository.findSquadLeaderboard(orderColumn, safeLimit, safeOffset);

        return rankSquad(rows, startRank);
    }

    private static List<IndividualLeaderboardRow> rankIndividual(
            List<LeaderboardRepository.UnrankedIndividualRow> rows, int startRank) {
        return java.util.stream.IntStream.range(0, rows.size())
                .mapToObj(i -> {
                    var r = rows.get(i);
                    return new IndividualLeaderboardRow(startRank + i, r.userId(), r.displayName(), r.totalPoints());
                })
                .toList();
    }

    private static List<SquadLeaderboardRow> rankSquad(
            List<LeaderboardRepository.UnrankedSquadRow> rows, int startRank) {
        return java.util.stream.IntStream.range(0, rows.size())
                .mapToObj(i -> {
                    var r = rows.get(i);
                    return new SquadLeaderboardRow(
                            startRank + i, r.squadId(), r.name(), r.memberCount(), r.totalPoints(), r.averagePoints());
                })
                .toList();
    }

    /** FR-014: sortBy defaults to total; anything other than total/average is a 400 (contract). */
    private static String orderColumnFor(String sortBy) {
        if (sortBy == null || sortBy.isBlank() || "total".equals(sortBy)) {
            return "total_points";
        }
        if ("average".equals(sortBy)) {
            return "average_points";
        }
        throw new ValidationException("sortBy must be 'total' or 'average'", List.of(
                new ErrorResponse.FieldError("sortBy", "must be 'total' or 'average'")));
    }

    private static int clampLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private static long safeOffset(Integer offset) {
        return offset == null || offset < 0 ? 0 : offset;
    }
}
