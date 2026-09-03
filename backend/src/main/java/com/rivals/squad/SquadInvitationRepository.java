package com.rivals.squad;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SquadInvitationRepository extends JpaRepository<SquadInvitation, UUID> {

    boolean existsBySquadIdAndInvitedUserIdAndStatus(UUID squadId, UUID invitedUserId, InvitationStatus status);

    List<SquadInvitation> findByInvitedUserIdAndStatusOrderByCreatedAtDesc(UUID invitedUserId, InvitationStatus status);
}
