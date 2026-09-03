package com.rivals.squad;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SquadMembershipRepository extends JpaRepository<SquadMembership, UUID> {

    Optional<SquadMembership> findByUserIdAndSquadId(UUID userId, UUID squadId);

    List<SquadMembership> findByUserId(UUID userId);

    List<SquadMembership> findBySquadId(UUID squadId);

    long countBySquadId(UUID squadId);

    void deleteByUserIdAndSquadId(UUID userId, UUID squadId);
}
