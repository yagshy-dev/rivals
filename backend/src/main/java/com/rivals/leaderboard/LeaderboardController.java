package com.rivals.leaderboard;

import com.rivals.leaderboard.dto.IndividualLeaderboardRow;
import com.rivals.leaderboard.dto.SquadLeaderboardRow;
import com.rivals.user.AppUserPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Read-only leaderboard endpoints (contracts/leaderboards.md) — covers User Story 5. */
@RestController
@RequestMapping("/api/leaderboards")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/individual")
    public List<IndividualLeaderboardRow> individual(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) UUID squadId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        return leaderboardService.individualLeaderboard(squadId, principal.getId(), limit, offset);
    }

    @GetMapping("/squads")
    public List<SquadLeaderboardRow> squads(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        return leaderboardService.squadLeaderboard(sortBy, limit, offset);
    }
}
