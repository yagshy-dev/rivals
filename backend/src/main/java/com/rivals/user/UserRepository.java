package com.rivals.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    /** FR-023: employee-directory search backing the invite picker. */
    List<User> findByDisplayNameContainingIgnoreCase(String search, Pageable pageable);
}
