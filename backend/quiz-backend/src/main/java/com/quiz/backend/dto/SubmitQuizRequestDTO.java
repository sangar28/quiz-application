package com.quiz.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class SubmitQuizRequestDTO {

    @NotNull(message = "Answers map is required")
    private Map<String, String> answers;

    public SubmitQuizRequestDTO() {
    }

    public SubmitQuizRequestDTO(Map<String, String> answers) {
        this.answers = answers;
    }

    public Map<String, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, String> answers) {
        this.answers = answers;
    }
}
