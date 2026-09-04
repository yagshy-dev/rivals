package com.rivals.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    private UUID id;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** FR-049, FR-051: optional public profile fields, shown on {@code PublicProfileResponse}.
     * {@code photoRef} is a storage reference (file uploaded via Account Settings), not a URL. */
    @Column(name = "photo_ref")
    private String photoRef;

    @Column(name = "quote")
    private String quote;

    protected User() {
    }

    public User(UUID id, String displayName, String email, String passwordHash, Role role, Instant createdAt) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
    }

    /** FR-049: a user may update their own personal quote. */
    public void updateQuote(String quote) {
        this.quote = quote;
    }

    /** FR-051: a user may set/replace their own profile photo by uploading a new file. */
    public void updatePhotoRef(String photoRef) {
        this.photoRef = photoRef;
    }

    /** FR-052: a user may change their own password after re-authenticating with the current one. */
    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    public UUID getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getPhotoRef() {
        return photoRef;
    }

    public String getQuote() {
        return quote;
    }
}
