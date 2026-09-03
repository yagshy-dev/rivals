package com.rivals.squad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "squad_memberships")
public class SquadMembership {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "squad_id", nullable = false)
    private UUID squadId;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    protected SquadMembership() {
    }

    public SquadMembership(UUID id, UUID userId, UUID squadId, Instant joinedAt) {
        this.id = id;
        this.userId = userId;
        this.squadId = squadId;
        this.joinedAt = joinedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getSquadId() {
        return squadId;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
