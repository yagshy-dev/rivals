package com.rivals.leaderboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SquadLeaderboardRow(
        int rank, UUID squadId, String name, long memberCount, BigDecimal totalPoints, BigDecimal averagePoints) {
}
