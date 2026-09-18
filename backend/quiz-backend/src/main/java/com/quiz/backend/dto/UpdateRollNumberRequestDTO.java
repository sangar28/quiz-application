package com.quiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateRollNumberRequestDTO {

    @NotBlank(message = "Roll number cannot be empty")
    @Pattern(regexp = "^[A-Za-z0-9\\-_/]{2,30}$", message = "Invalid roll number format")
    private String rollNumber;

    public UpdateRollNumberRequestDTO() {
    }

    public UpdateRollNumberRequestDTO(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
}
