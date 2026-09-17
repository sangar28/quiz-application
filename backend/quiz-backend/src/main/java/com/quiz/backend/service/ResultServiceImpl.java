package com.quiz.backend.service;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.dto.PageResponseDTO;
import com.quiz.backend.entity.Result;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;
    private final QuizRepository quizRepository;

    public ResultServiceImpl(ResultRepository resultRepository, QuizRepository quizRepository) {
        this.resultRepository = resultRepository;
        this.quizRepository = quizRepository;
    }

    @Override
    public List<AdminResultResponseDTO> getAllResults() {
        return resultRepository.findAll()
                .stream()
                .map(this::mapToAdminResultResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminResultResponseDTO> getResultsByQuiz(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId);
        }

        return resultRepository.findByQuizId(quizId)
                .stream()
                .map(this::mapToAdminResultResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponseDTO<AdminResultResponseDTO> getFilteredResults(Long quizId, String search, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        boolean hasQuiz = quizId != null;
        boolean hasSearch = cleanSearch != null;

        Page<Result> resultPage;
        if (hasQuiz && hasSearch) {
            resultPage = resultRepository.findByQuizIdAndSearchOrderBySubmittedAtDesc(quizId, cleanSearch, pageable);
        } else if (hasQuiz) {
            resultPage = resultRepository.findByQuizIdOrderBySubmittedAtDesc(quizId, pageable);
        } else if (hasSearch) {
            resultPage = resultRepository.findBySearchOrderBySubmittedAtDesc(cleanSearch, pageable);
        } else {
            resultPage = resultRepository.findAllByOrderBySubmittedAtDesc(pageable);
        }

        Page<AdminResultResponseDTO> dtoPage = resultPage.map(this::mapToAdminResultResponseDTO);
        return PageResponseDTO.from(dtoPage);
    }

    @Override
    public byte[] exportResultsToExcel(Long quizId, String search) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        boolean hasQuiz = quizId != null;
        boolean hasSearch = cleanSearch != null;

        List<Result> results;
        if (hasQuiz && hasSearch) {
            results = resultRepository.findByQuizIdAndSearchOrderBySubmittedAtDesc(quizId, cleanSearch);
        } else if (hasQuiz) {
            results = resultRepository.findByQuizIdOrderBySubmittedAtDesc(quizId);
        } else if (hasSearch) {
            results = resultRepository.findBySearchOrderBySubmittedAtDesc(cleanSearch);
        } else {
            results = resultRepository.findAllByOrderBySubmittedAtDesc();
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Quiz Results");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "Student Name",
                    "Student Email",
                    "Quiz",
                    "Score",
                    "Total Questions",
                    "Percentage",
                    "Submitted At",
                    "Retake Status",
                    "Attempt ID"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            int rowIdx = 1;
            for (Result r : results) {
                Row row = sheet.createRow(rowIdx++);

                String studentName = r.getUser() != null ? r.getUser().getName() : "N/A";
                String studentEmail = r.getUser() != null ? r.getUser().getEmail() : "N/A";
                String quizTitle = r.getQuiz() != null ? r.getQuiz().getTitle() : "N/A";
                int score = r.getScore() != null ? r.getScore() : 0;
                int totalQuestions = r.getTotalQuestions() != null ? r.getTotalQuestions() : 0;

                String percentageStr;
                if (totalQuestions > 0) {
                    double pct = ((double) score / totalQuestions) * 100.0;
                    percentageStr = Math.round(pct) + "%";
                } else {
                    percentageStr = "0%";
                }

                String submittedAtStr = r.getSubmittedAt() != null ? r.getSubmittedAt().format(dtf) : "N/A";
                String retakeStatus = r.isRetakeApproved() ? "APPROVED" : "NOT APPROVED";
                String attemptIdStr = r.getAttemptId() != null ? String.valueOf(r.getAttemptId()) : "N/A";

                row.createCell(0).setCellValue(studentName != null ? studentName : "N/A");
                row.createCell(1).setCellValue(studentEmail != null ? studentEmail : "N/A");
                row.createCell(2).setCellValue(quizTitle != null ? quizTitle : "N/A");
                row.createCell(3).setCellValue(score);
                row.createCell(4).setCellValue(totalQuestions);
                row.createCell(5).setCellValue(percentageStr);
                row.createCell(6).setCellValue(submittedAtStr);
                row.createCell(7).setCellValue(retakeStatus);
                row.createCell(8).setCellValue(attemptIdStr);
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate Excel file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AdminResultResponseDTO approveRetake(Long resultId) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found with id: " + resultId));

        result.setRetakeApproved(true);
        result = resultRepository.save(result);

        return mapToAdminResultResponseDTO(result);
    }

    private AdminResultResponseDTO mapToAdminResultResponseDTO(Result result) {
        String studentName = result.getUser() != null ? result.getUser().getName() : null;
        String studentEmail = result.getUser() != null ? result.getUser().getEmail() : null;
        String quizTitle = result.getQuiz() != null ? result.getQuiz().getTitle() : null;

        return new AdminResultResponseDTO(
                result.getId(),
                studentName,
                studentEmail,
                quizTitle,
                result.getScore(),
                result.getTotalQuestions(),
                result.getSubmittedAt(),
                result.isRetakeApproved(),
                result.getAttemptId()
        );
    }
}
