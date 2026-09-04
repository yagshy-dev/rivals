package com.rivals.activity;

import com.rivals.common.ErrorResponse;
import com.rivals.common.NotFoundException;
import com.rivals.common.ValidationException;
import com.rivals.squad.Squad;
import com.rivals.squad.SquadMembershipRepository;
import com.rivals.squad.SquadRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * FR-002, FR-047, FR-048: entry validation for a new activity submission — a positive metric
 * value, a target Squad the submitter currently belongs to, and an activity type that Squad
 * allows.
 */
@Component
public class ActivitySubmissionValidator {

    private final SquadRepository squadRepository;
    private final SquadMembershipRepository membershipRepository;

    public ActivitySubmissionValidator(SquadRepository squadRepository, SquadMembershipRepository membershipRepository) {
        this.squadRepository = squadRepository;
        this.membershipRepository = membershipRepository;
    }

    public void validateMetricValue(BigDecimal metricValue) {
        if (metricValue == null || metricValue.signum() <= 0) {
            throw new ValidationException("metricValue must be greater than 0", List.of(
                    new ErrorResponse.FieldError("metricValue", "must be greater than 0")));
        }
    }

    /**
     * FR-002, FR-047, FR-048: the caller must currently be a Member/Manager of {@code targetSquadId},
     * and {@code activityType} must be one that squad allows.
     */
    public Squad validateTargetSquad(UUID targetSquadId, ActivityType activityType, UUID submitterId) {
        if (targetSquadId == null) {
            throw new ValidationException("targetSquadId must not be blank", List.of(
                    new ErrorResponse.FieldError("targetSquadId", "must not be blank")));
        }
        Squad squad = squadRepository.findById(targetSquadId)
                .orElseThrow(() -> new NotFoundException("Squad not found: " + targetSquadId));
        if (membershipRepository.findByUserIdAndSquadId(submitterId, targetSquadId).isEmpty()) {
            throw new ValidationException("You must be a member of the target squad to submit to it", List.of(
                    new ErrorResponse.FieldError("targetSquadId", "must be a squad you belong to")));
        }
        if (!squad.getAllowedActivityTypes().contains(activityType)) {
            throw new ValidationException(
                    "activityType is not allowed by the selected squad", List.of(
                            new ErrorResponse.FieldError("activityType", "not allowed by the selected squad")));
        }
        return squad;
    }
}
