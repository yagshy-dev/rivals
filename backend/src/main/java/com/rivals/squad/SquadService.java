package com.rivals.squad;

import com.rivals.common.ConflictException;
import com.rivals.common.NotFoundException;
import com.rivals.common.OffsetLimitPageable;
import com.rivals.squad.dto.SquadSummaryResponse;
import java.time.Instant;
import java.util.List;
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

    public SquadService(SquadRepository squadRepository, SquadMembershipRepository membershipRepository) {
        this.squadRepository = squadRepository;
        this.membershipRepository = membershipRepository;
    }

    /** FR-010, paginated per SC-007. */
    public List<SquadSummaryResponse> search(String search, Integer limit, Integer offset, UUID currentUserId) {
        int safeLimit = clampLimit(limit);
        long safeOffset = offset == null || offset < 0 ? 0 : offset;
        String query = search == null ? "" : search;

        List<Squad> squads = squadRepository.findByNameContainingIgnoreCase(
                query, OffsetLimitPageable.of(safeOffset, safeLimit, Sort.by("name")));

        Set<UUID> memberSquadIds = membershipRepository.findByUserId(currentUserId).stream()
                .map(SquadMembership::getSquadId)
                .collect(Collectors.toSet());

        return squads.stream()
                .map(s -> SquadSummaryResponse.of(
                        s, membershipRepository.countBySquadId(s.getId()), memberSquadIds.contains(s.getId())))
                .toList();
    }

    /** FR-011: creator becomes the first member; name is unique case-insensitively. */
    @Transactional
    public SquadSummaryResponse create(String name, UUID creatorId) {
        if (squadRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ConflictException("A squad named '" + name + "' already exists");
        }
        Squad squad = new Squad(UUID.randomUUID(), name, creatorId, Instant.now());
        squadRepository.save(squad);
        membershipRepository.save(new SquadMembership(UUID.randomUUID(), creatorId, squad.getId(), Instant.now()));
        return SquadSummaryResponse.of(squad, 1, true);
    }

    /** FR-012: idempotent-safe join. */
    @Transactional
    public SquadSummaryResponse join(UUID squadId, UUID userId) {
        Squad squad = findOrThrow(squadId);
        if (membershipRepository.findByUserIdAndSquadId(userId, squadId).isEmpty()) {
            membershipRepository.save(new SquadMembership(UUID.randomUUID(), userId, squadId, Instant.now()));
        }
        return SquadSummaryResponse.of(squad, membershipRepository.countBySquadId(squadId), true);
    }

    /** FR-012. */
    @Transactional
    public SquadSummaryResponse leave(UUID squadId, UUID userId) {
        Squad squad = findOrThrow(squadId);
        SquadMembership membership = membershipRepository.findByUserIdAndSquadId(userId, squadId)
                .orElseThrow(() -> new NotFoundException("Not a member of this squad"));
        membershipRepository.delete(membership);
        return SquadSummaryResponse.of(squad, membershipRepository.countBySquadId(squadId), false);
    }

    private Squad findOrThrow(UUID squadId) {
        return squadRepository.findById(squadId)
                .orElseThrow(() -> new NotFoundException("Squad not found: " + squadId));
    }

    private static int clampLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
