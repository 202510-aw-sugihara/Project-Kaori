package com.example.shizuka.exception;

import com.example.shizuka.dto.response.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
            WebRequest request) {
        List<ErrorResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> ErrorResponse.FieldError.builder()
                        .field(fieldError.getField())
                        .reason(fieldError.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());
        ErrorResponse body = buildError(HttpStatus.BAD_REQUEST, "validation error", request.getDescription(false),
                details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
            WebRequest request) {
        List<ErrorResponse.FieldError> details = ex.getConstraintViolations().stream()
                .map(cv -> ErrorResponse.FieldError.builder()
                        .field(cv.getPropertyPath().toString())
                        .reason(cv.getMessage())
                        .build())
                .collect(Collectors.toList());
        ErrorResponse body = buildError(HttpStatus.BAD_REQUEST, "validation error", request.getDescription(false),
                details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    protected ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    protected ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    protected ResponseEntity<ErrorResponse> handleBusiness(BusinessRuleViolationException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
            WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.CONFLICT, "Database constraint violation",
                request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    protected ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.UNAUTHORIZED, "Authentication failed", request.getDescription(false),
                null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.FORBIDDEN, "Access denied", request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    protected ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        ErrorResponse body = buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    protected ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        ErrorResponse body = buildError(status, message, request.getDescription(false), null);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    protected ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
            WebRequest request) {
        HttpStatus status = HttpStatus.METHOD_NOT_ALLOWED;
        ErrorResponse body = buildError(status, status.getReasonPhrase(), request.getDescription(false), null);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest request) {
        ex.printStackTrace();
        ErrorResponse body = buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                request.getDescription(false), null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ErrorResponse buildError(HttpStatus status,
            String message,
            String path,
            List<ErrorResponse.FieldError> details) {
        return ErrorResponse.builder()
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .details(details)
                .path(path.replace("uri=", ""))
                .build();
    }
}
