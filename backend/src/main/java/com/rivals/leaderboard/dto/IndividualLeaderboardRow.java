package com.rivals.leaderboard.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record IndividualLeaderboardRow(int rank, UUID userId, String displayName, BigDecimal totalPoints) {
}
