package com.rivals.common;

import java.util.List;

/** Thrown for manual (non-{@code @Valid}) request validation failures. */
public class ValidationException extends RuntimeException {

    private final List<ErrorResponse.FieldError> fieldErrors;

    public ValidationException(String message, List<ErrorResponse.FieldError> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public ValidationException(String message) {
        this(message, null);
    }

    public List<ErrorResponse.FieldError> getFieldErrors() {
        return fieldErrors;
    }
}
