package com.rivals.squad;

import com.rivals.common.ConflictException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * State machine (data-model.md): PENDING is the only state from which a transition
 * (accept/decline) is possible; both ACCEPTED and DECLINED are terminal.
 */
@Entity
@Table(name = "squad_invitations")
public class SquadInvitation {

    @Id
    private UUID id;

    @Column(name = "squad_id", nullable = false)
    private UUID squadId;

    @Column(name = "invited_user_id", nullable = false)
    private UUID invitedUserId;

    @Column(name = "invited_by_user_id", nullable = false)
    private UUID invitedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    protected SquadInvitation() {
    }

    public SquadInvitation(UUID id, UUID squadId, UUID invitedUserId, UUID invitedByUserId, Instant createdAt) {
        this.id = id;
        this.squadId = squadId;
        this.invitedUserId = invitedUserId;
        this.invitedByUserId = invitedByUserId;
        this.status = InvitationStatus.PENDING;
        this.createdAt = createdAt;
    }

    /** FR-027: only a currently-PENDING invitation can be accepted. */
    public void accept(Instant decidedAt) {
        requirePending();
        this.status = InvitationStatus.ACCEPTED;
        this.decidedAt = decidedAt;
    }

    /** FR-028: only a currently-PENDING invitation can be declined. */
    public void decline(Instant decidedAt) {
        requirePending();
        this.status = InvitationStatus.DECLINED;
        this.decidedAt = decidedAt;
    }

    private void requirePending() {
        if (this.status != InvitationStatus.PENDING) {
            throw new ConflictException("Invitation has already been decided");
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getSquadId() {
        return squadId;
    }

    public UUID getInvitedUserId() {
        return invitedUserId;
    }

    public UUID getInvitedByUserId() {
        return invitedByUserId;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDecidedAt() {
        return decidedAt;
    }
}
