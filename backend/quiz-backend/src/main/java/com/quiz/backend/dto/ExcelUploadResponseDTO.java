package com.quiz.backend.dto;

public class ExcelUploadResponseDTO {

    private String message;
    private Long quizId;
    private int importedQuestions;

    public ExcelUploadResponseDTO() {
    }

    public ExcelUploadResponseDTO(String message, Long quizId, int importedQuestions) {
        this.message = message;
        this.quizId = quizId;
        this.importedQuestions = importedQuestions;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public int getImportedQuestions() {
        return importedQuestions;
    }

    public void setImportedQuestions(int importedQuestions) {
        this.importedQuestions = importedQuestions;
    }
}
