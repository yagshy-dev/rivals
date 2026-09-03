package com.rivals.activity;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivitySubmissionRepository extends JpaRepository<ActivitySubmission, UUID> {

    List<ActivitySubmission> findByUserIdOrderBySubmittedAtDesc(UUID userId);

    List<ActivitySubmission> findByStatusOrderBySubmittedAtAsc(SubmissionStatus status);
}
