package com.example.shizuka.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

public class ErrorResponse {
    private final OffsetDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final List<FieldError> details;
    private final String path;

    private ErrorResponse(Builder builder) {
        this.timestamp = builder.timestamp;
        this.status = builder.status;
        this.error = builder.error;
        this.message = builder.message;
        this.details = builder.details;
        this.path = builder.path;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public List<FieldError> getDetails() {
        return details;
    }

    public String getPath() {
        return path;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private OffsetDateTime timestamp;
        private int status;
        private String error;
        private String message;
        private List<FieldError> details;
        private String path;

        public Builder timestamp(OffsetDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder error(String error) {
            this.error = error;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder details(List<FieldError> details) {
            this.details = details;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(this);
        }
    }

    public static class FieldError {
        private String field;
        private String reason;

        private FieldError(Builder builder) {
            this.field = builder.field;
            this.reason = builder.reason;
        }

        public String getField() {
            return field;
        }

        public String getReason() {
            return reason;
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String field;
            private String reason;

            public Builder field(String field) {
                this.field = field;
                return this;
            }

            public Builder reason(String reason) {
                this.reason = reason;
                return this;
            }

            public FieldError build() {
                return new FieldError(this);
            }
        }
    }
}
