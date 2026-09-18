package com.quiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateQuizRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Duration in minutes is required")
    @Positive(message = "Duration in minutes must be positive")
    private Integer durationMinutes;

    private boolean detectTabSwitch = true;

    private boolean autoSubmitOnViolation = true;

    private Integer violationThreshold = 3;

    public CreateQuizRequestDTO() {
    }

    public CreateQuizRequestDTO(String title, String description, Integer durationMinutes) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.detectTabSwitch = true;
        this.autoSubmitOnViolation = true;
        this.violationThreshold = 3;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isDetectTabSwitch() {
        return detectTabSwitch;
    }

    public void setDetectTabSwitch(boolean detectTabSwitch) {
        this.detectTabSwitch = detectTabSwitch;
    }

    public boolean isAutoSubmitOnViolation() {
        return autoSubmitOnViolation;
    }

    public void setAutoSubmitOnViolation(boolean autoSubmitOnViolation) {
        this.autoSubmitOnViolation = autoSubmitOnViolation;
    }

    public Integer getViolationThreshold() {
        return violationThreshold;
    }

    public void setViolationThreshold(Integer violationThreshold) {
        this.violationThreshold = violationThreshold;
    }
}
