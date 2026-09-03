package com.rivals.activity;

import com.rivals.common.ErrorResponse;
import com.rivals.common.ValidationException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;

/** FR-002: entry validation for a new activity submission. */
@Component
public class ActivitySubmissionValidator {

    public void validateMetricValue(BigDecimal metricValue) {
        if (metricValue == null || metricValue.signum() <= 0) {
            throw new ValidationException("metricValue must be greater than 0", List.of(
                    new ErrorResponse.FieldError("metricValue", "must be greater than 0")));
        }
    }
}
