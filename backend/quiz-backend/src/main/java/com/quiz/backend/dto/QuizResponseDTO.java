package com.quiz.backend.dto;

public class QuizResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;

    public QuizResponseDTO() {
    }

    public QuizResponseDTO(Long id, String title, String description, Integer durationMinutes) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}