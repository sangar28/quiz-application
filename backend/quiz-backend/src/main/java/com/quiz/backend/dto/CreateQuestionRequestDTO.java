package com.quiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateQuestionRequestDTO {

    @NotBlank(message = "questionText is required")
    private String questionText;

    @NotBlank(message = "optionA is required")
    private String optionA;

    @NotBlank(message = "optionB is required")
    private String optionB;

    @NotBlank(message = "optionC is required")
    private String optionC;

    @NotBlank(message = "optionD is required")
    private String optionD;

    @NotBlank(message = "correctOption is required")
    @Pattern(regexp = "^[A-Da-d]$", message = "correctOption must be A, B, C, or D")
    private String correctOption;

    public CreateQuestionRequestDTO() {
    }

    public CreateQuestionRequestDTO(String questionText, String optionA, String optionB,
                                    String optionC, String optionD, String correctOption) {
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }
}
