package com.quiz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class QuizAttemptResponseDTO {

    @JsonProperty("attemptId")
    private Long attemptId;

    @JsonProperty("quizId")
    private Long quizId;

    @JsonProperty("startedAt")
    private LocalDateTime startedAt;

    @JsonProperty("expiresAt")
    private LocalDateTime expiresAt;

    @JsonProperty("remainingSeconds")
    private Long remainingSeconds;

    @JsonProperty("submitted")
    private boolean submitted;

    public QuizAttemptResponseDTO() {
    }

    public QuizAttemptResponseDTO(Long attemptId, Long quizId, LocalDateTime startedAt, LocalDateTime expiresAt) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.submitted = false;
        if (expiresAt != null) {
            this.remainingSeconds = Math.max(0, java.time.Duration.between(LocalDateTime.now(), expiresAt).getSeconds());
        }
    }

    public QuizAttemptResponseDTO(Long attemptId, Long quizId, LocalDateTime startedAt, LocalDateTime expiresAt, Long remainingSeconds, boolean submitted) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.remainingSeconds = remainingSeconds;
        this.submitted = submitted;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(Long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public boolean isSubmitted() {
        return submitted;
    }

    public void setSubmitted(boolean submitted) {
        this.submitted = submitted;
    }
}
