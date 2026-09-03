package com.rivals.leaderboard;

import com.rivals.common.ErrorResponse;
import com.rivals.common.ForbiddenException;
import com.rivals.common.NotFoundException;
import com.rivals.common.ValidationException;
import com.rivals.leaderboard.dto.IndividualLeaderboardRow;
import com.rivals.leaderboard.dto.SquadLeaderboardRow;
import com.rivals.squad.SquadMembershipRepository;
import com.rivals.squad.SquadRepository;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class LeaderboardService {

    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 200;

    private final LeaderboardRepository repository;
    private final SquadRepository squadRepository;
    private final SquadMembershipRepository membershipRepository;

    public LeaderboardService(LeaderboardRepository repository, SquadRepository squadRepository,
            SquadMembershipRepository membershipRepository) {
        this.repository = repository;
        this.squadRepository = squadRepository;
        this.membershipRepository = membershipRepository;
    }

    /**
     * FR-033, FR-034, FR-035: {@code squadId} omitted is the Global view (all users, the
     * default); provided, it is the per-squad view restricted to that squad's current members,
     * and the caller MUST currently be a member of it.
     */
    public List<IndividualLeaderboardRow> individualLeaderboard(
            UUID squadId, UUID requesterId, Integer limit, Integer offset) {
        int safeLimit = clampLimit(limit);
        long safeOffset = safeOffset(offset);
        int startRank = (int) safeOffset + 1;

        List<LeaderboardRepository.UnrankedIndividualRow> rows;
        if (squadId == null) {
            rows = repository.findIndividualLeaderboard(safeLimit, safeOffset);
        } else {
            if (!squadRepository.existsById(squadId)) {
                throw new NotFoundException("Squad not found: " + squadId);
            }
            if (membershipRepository.findByUserIdAndSquadId(requesterId, squadId).isEmpty()) {
                throw new ForbiddenException("You are not a member of this squad");
            }
            rows = repository.findIndividualLeaderboardForSquad(squadId, safeLimit, safeOffset);
        }

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
