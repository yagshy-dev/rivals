package com.rivals.squad;

import com.rivals.activity.ActivityType;
import com.rivals.common.ConflictException;
import com.rivals.common.ForbiddenException;
import com.rivals.common.NotFoundException;
import com.rivals.common.OffsetLimitPageable;
import com.rivals.squad.dto.SquadInvitationResponse;
import com.rivals.squad.dto.SquadMemberResponse;
import com.rivals.squad.dto.SquadSummaryResponse;
import com.rivals.user.User;
import com.rivals.user.UserRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SquadService {

    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 200;

    private final SquadRepository squadRepository;
    private final SquadMembershipRepository membershipRepository;
    private final SquadInvitationRepository invitationRepository;
    private final UserRepository userRepository;

    public SquadService(SquadRepository squadRepository, SquadMembershipRepository membershipRepository,
            SquadInvitationRepository invitationRepository, UserRepository userRepository) {
        this.squadRepository = squadRepository;
        this.membershipRepository = membershipRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
    }

    /**
     * FR-010, FR-021, FR-035, paginated per SC-007. {@code mine} restricts results to squads the
     * caller currently belongs to (used by the leaderboard selector and the promote/invite squad
     * picker).
     */
    public List<SquadSummaryResponse> search(
            String search, boolean mine, Integer limit, Integer offset, UUID currentUserId) {
        int safeLimit = clampLimit(limit);
        long safeOffset = offset == null || offset < 0 ? 0 : offset;
        String query = search == null ? "" : search;

        Map<UUID, SquadRole> myRoleBySquadId = membershipRepository.findByUserId(currentUserId).stream()
                .collect(Collectors.toMap(SquadMembership::getSquadId, SquadMembership::getRole));

        if (mine && myRoleBySquadId.isEmpty()) {
            return List.of();
        }

        List<Squad> squads = mine
                ? squadRepository.findByIdInAndNameContainingIgnoreCase(
                        myRoleBySquadId.keySet(), query, OffsetLimitPageable.of(safeOffset, safeLimit, Sort.by("name")))
                : squadRepository.findByNameContainingIgnoreCase(
                        query, OffsetLimitPageable.of(safeOffset, safeLimit, Sort.by("name")));

        return squads.stream()
                .map(s -> SquadSummaryResponse.of(
                        s,
                        membershipRepository.countBySquadId(s.getId()),
                        myRoleBySquadId.containsKey(s.getId()),
                        myRoleBySquadId.get(s.getId())))
                .toList();
    }

    /**
     * FR-011, FR-020, FR-046: creator becomes the first member, with role Manager; name is unique
     * case-insensitively. {@code allowedActivityTypes} defaults to all four types when null/empty.
     */
    @Transactional
    public SquadSummaryResponse create(String name, Set<ActivityType> allowedActivityTypes, UUID creatorId) {
        if (squadRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ConflictException("A squad named '" + name + "' already exists");
        }
        Set<ActivityType> normalizedTypes = allowedActivityTypes == null || allowedActivityTypes.isEmpty()
                ? EnumSet.allOf(ActivityType.class)
                : EnumSet.copyOf(allowedActivityTypes);
        Squad squad = new Squad(UUID.randomUUID(), name, creatorId, Instant.now(), normalizedTypes);
        squadRepository.save(squad);
        membershipRepository.save(
                new SquadMembership(UUID.randomUUID(), creatorId, squad.getId(), SquadRole.MANAGER, Instant.now()));
        return SquadSummaryResponse.of(squad, 1, true, SquadRole.MANAGER);
    }

    /** FR-012. Leaving remains available; joining is invite-only (see {@link #invite}, {@link InvitationService}). */
    @Transactional
    public SquadSummaryResponse leave(UUID squadId, UUID userId) {
        Squad squad = findOrThrow(squadId);
        SquadMembership membership = membershipRepository.findByUserIdAndSquadId(userId, squadId)
                .orElseThrow(() -> new NotFoundException("Not a member of this squad"));
        membershipRepository.delete(membership);
        return SquadSummaryResponse.of(squad, membershipRepository.countBySquadId(squadId), false, null);
    }

    /** FR-021: any current member of the squad can view the roster and each member's role. */
    public List<SquadMemberResponse> getMembers(UUID squadId, UUID requesterId) {
        findOrThrow(squadId);
        requireMember(squadId, requesterId);
        return membershipRepository.findBySquadId(squadId).stream()
                .map(m -> SquadMemberResponse.of(m, displayNameOf(m.getUserId())))
                .toList();
    }

    /** FR-031, FR-032: only a Manager of this squad may promote a Member to also be a Manager. */
    @Transactional
    public SquadMemberResponse promote(UUID squadId, UUID targetUserId, UUID requesterId) {
        findOrThrow(squadId);
        requireManager(squadId, requesterId);
        SquadMembership target = membershipRepository.findByUserIdAndSquadId(targetUserId, squadId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this squad"));
        target.promoteToManager();
        membershipRepository.save(target);
        return SquadMemberResponse.of(target, displayNameOf(targetUserId));
    }

    /** FR-022, FR-024, FR-029, FR-030: only a Manager may invite; no duplicate-pending or already-member invitee. */
    @Transactional
    public SquadInvitationResponse invite(UUID squadId, UUID invitedUserId, UUID requesterId) {
        Squad squad = findOrThrow(squadId);
        requireManager(squadId, requesterId);
        User invitee = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + invitedUserId));
        if (membershipRepository.findByUserIdAndSquadId(invitee.getId(), squadId).isPresent()) {
            throw new ConflictException("User is already a member of this squad");
        }
        if (invitationRepository.existsBySquadIdAndInvitedUserIdAndStatus(
                squadId, invitee.getId(), InvitationStatus.PENDING)) {
            throw new ConflictException("User already has a pending invitation to this squad");
        }
        SquadInvitation invitation =
                new SquadInvitation(UUID.randomUUID(), squadId, invitee.getId(), requesterId, Instant.now());
        invitationRepository.save(invitation);
        return SquadInvitationResponse.of(invitation, squad.getName(), displayNameOf(requesterId));
    }

    private void requireManager(UUID squadId, UUID userId) {
        SquadMembership membership = membershipRepository.findByUserIdAndSquadId(userId, squadId)
                .orElseThrow(() -> new ForbiddenException("Only a Manager of this squad may perform this action"));
        if (membership.getRole() != SquadRole.MANAGER) {
            throw new ForbiddenException("Only a Manager of this squad may perform this action");
        }
    }

    private void requireMember(UUID squadId, UUID userId) {
        if (membershipRepository.findByUserIdAndSquadId(userId, squadId).isEmpty()) {
            throw new ForbiddenException("You are not a member of this squad");
        }
    }

    private Squad findOrThrow(UUID squadId) {
        return squadRepository.findById(squadId)
                .orElseThrow(() -> new NotFoundException("Squad not found: " + squadId));
    }

    private String displayNameOf(UUID userId) {
        return userRepository.findById(userId).map(User::getDisplayName).orElse("Unknown");
    }

    private static int clampLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
