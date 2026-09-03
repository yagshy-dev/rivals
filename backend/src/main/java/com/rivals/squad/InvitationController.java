package com.rivals.squad;

import com.rivals.squad.dto.SquadInvitationResponse;
import com.rivals.user.AppUserPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Squad invitation endpoints (contracts/invitations.md) — covers User Story 4. */
@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping
    public List<SquadInvitationResponse> mine(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(required = false) InvitationStatus status) {
        return invitationService.listMine(principal.getId(), status == null ? InvitationStatus.PENDING : status);
    }

    @PostMapping("/{id}/accept")
    public SquadInvitationResponse accept(
            @AuthenticationPrincipal AppUserPrincipal principal, @PathVariable UUID id) {
        return invitationService.accept(id, principal.getId());
    }

    @PostMapping("/{id}/decline")
    public SquadInvitationResponse decline(
            @AuthenticationPrincipal AppUserPrincipal principal, @PathVariable UUID id) {
        return invitationService.decline(id, principal.getId());
    }
}
