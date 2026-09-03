package com.rivals.squad;

import com.rivals.common.ForbiddenException;
import com.rivals.common.NotFoundException;
import com.rivals.squad.dto.SquadInvitationResponse;
import com.rivals.user.User;
import com.rivals.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvitationService {

    private final SquadInvitationRepository invitationRepository;
    private final SquadRepository squadRepository;
    private final SquadMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    public InvitationService(SquadInvitationRepository invitationRepository, SquadRepository squadRepository,
            SquadMembershipRepository membershipRepository, UserRepository userRepository) {
        this.invitationRepository = invitationRepository;
        this.squadRepository = squadRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
    }

    /** FR-026: the caller's own invitations, filtered by status (defaults to Pending at the controller). */
    public List<SquadInvitationResponse> listMine(UUID userId, InvitationStatus status) {
        return invitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    /** FR-025, FR-027: accepting creates a Member membership (if one doesn't already exist) and marks the invite Accepted. */
    @Transactional
    public SquadInvitationResponse accept(UUID invitationId, UUID userId) {
        SquadInvitation invitation = findOrThrow(invitationId);
        requireInvitee(invitation, userId);
        invitation.accept(Instant.now());
        invitationRepository.save(invitation);
        if (membershipRepository.findByUserIdAndSquadId(userId, invitation.getSquadId()).isEmpty()) {
            membershipRepository.save(new SquadMembership(
                    UUID.randomUUID(), userId, invitation.getSquadId(), SquadRole.MEMBER, Instant.now()));
        }
        return toResponse(invitation);
    }

    /** FR-028: no membership is created; does not block a future invite to the same user/squad. */
    @Transactional
    public SquadInvitationResponse decline(UUID invitationId, UUID userId) {
        SquadInvitation invitation = findOrThrow(invitationId);
        requireInvitee(invitation, userId);
        invitation.decline(Instant.now());
        invitationRepository.save(invitation);
        return toResponse(invitation);
    }

    private void requireInvitee(SquadInvitation invitation, UUID userId) {
        if (!invitation.getInvitedUserId().equals(userId)) {
            throw new ForbiddenException("This invitation is not addressed to you");
        }
    }

    private SquadInvitation findOrThrow(UUID invitationId) {
        return invitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found: " + invitationId));
    }

    private SquadInvitationResponse toResponse(SquadInvitation invitation) {
        String squadName = squadRepository.findById(invitation.getSquadId()).map(Squad::getName).orElse("Unknown");
        String invitedByDisplayName = userRepository.findById(invitation.getInvitedByUserId())
                .map(User::getDisplayName)
                .orElse("Unknown");
        return SquadInvitationResponse.of(invitation, squadName, invitedByDisplayName);
    }
}
