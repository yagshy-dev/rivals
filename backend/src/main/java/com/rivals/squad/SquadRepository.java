package com.rivals.squad;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SquadRepository extends JpaRepository<Squad, UUID> {

    Optional<Squad> findByNameIgnoreCase(String name);

    /** Every name contains "", so passing an empty search matches all squads (FR-010). */
    List<Squad> findByNameContainingIgnoreCase(String search, Pageable pageable);

    /** FR-035: the leaderboard selector's "my squads" list, restricted to a set of squad ids. */
    List<Squad> findByIdInAndNameContainingIgnoreCase(Collection<UUID> ids, String search, Pageable pageable);
}
