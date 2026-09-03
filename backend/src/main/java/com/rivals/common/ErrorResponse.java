package com.rivals.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** The single error envelope shape used by every non-2xx response (contracts/errors.md). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(int status, String error, String message, List<FieldError> fieldErrors) {

    public record FieldError(String field, String message) {
    }

    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(status, error, message, null);
    }

    public static ErrorResponse validation(String message, List<FieldError> fieldErrors) {
        return new ErrorResponse(400, "VALIDATION_ERROR", message, fieldErrors);
    }
}
