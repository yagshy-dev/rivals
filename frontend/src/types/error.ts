export interface FieldError {
  field: string;
  message: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  status: number;
  error: ErrorCode;
  message: string;
  fieldErrors?: FieldError[];
}

export class ApiError extends Error {
  readonly response: ErrorResponse;

  constructor(response: ErrorResponse) {
    super(response.message);
    this.response = response;
  }
}
