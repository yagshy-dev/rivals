package com.rivals.squad;

import com.rivals.squad.dto.CreateInvitationRequest;
import com.rivals.squad.dto.CreateSquadRequest;
import com.rivals.squad.dto.SquadInvitationResponse;
import com.rivals.squad.dto.SquadMemberResponse;
import com.rivals.squad.dto.SquadSummaryResponse;
import com.rivals.user.AppUserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Squad endpoints (contracts/squads.md) — covers User Story 3 and User Story 4. */
@RestController
@RequestMapping("/api/squads")
public class SquadController {

    private final SquadService squadService;

    public SquadController(SquadService squadService) {
        this.squadService = squadService;
    }

    @GetMapping
    public List<SquadSummaryResponse> search(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean mine,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        return squadService.search(search, mine, limit, offset, principal.getId());
    }

    @PostMapping
    public ResponseEntity<SquadSummaryResponse> create(
            @AuthenticationPrincipal AppUserPrincipal principal, @Valid @RequestBody CreateSquadRequest request) {
        return ResponseEntity.status(201)
                .body(squadService.create(request.name(), request.allowedActivityTypes(), principal.getId()));
    }

    @PostMapping("/{id}/leave")
    public SquadSummaryResponse leave(@AuthenticationPrincipal AppUserPrincipal principal, @PathVariable UUID id) {
        return squadService.leave(id, principal.getId());
    }

    @GetMapping("/{id}/members")
    public List<SquadMemberResponse> members(
            @AuthenticationPrincipal AppUserPrincipal principal, @PathVariable UUID id) {
        return squadService.getMembers(id, principal.getId());
    }

    @PostMapping("/{id}/members/{userId}/promote")
    public SquadMemberResponse promote(@AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable UUID id, @PathVariable UUID userId) {
        return squadService.promote(id, userId, principal.getId());
    }

    @PostMapping("/{id}/invitations")
    public ResponseEntity<SquadInvitationResponse> invite(@AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable UUID id, @Valid @RequestBody CreateInvitationRequest request) {
        return ResponseEntity.status(201)
                .body(squadService.invite(id, request.invitedUserId(), principal.getId()));
    }
}
