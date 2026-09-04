package com.rivals.squad;

import com.rivals.activity.ActivityType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "squads")
public class Squad {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** FR-046: the subset of the four activity types this squad accepts submissions for. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "squad_allowed_activity_types", joinColumns = @JoinColumn(name = "squad_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type")
    private Set<ActivityType> allowedActivityTypes = new HashSet<>();

    protected Squad() {
    }

    public Squad(UUID id, String name, UUID createdByUserId, Instant createdAt, Set<ActivityType> allowedActivityTypes) {
        this.id = id;
        this.name = name;
        this.createdByUserId = createdByUserId;
        this.createdAt = createdAt;
        this.allowedActivityTypes = allowedActivityTypes;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public UUID getCreatedByUserId() {
        return createdByUserId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Set<ActivityType> getAllowedActivityTypes() {
        return allowedActivityTypes;
    }
}
