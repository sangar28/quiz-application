package com.quiz.backend.controller;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.dto.PageResponseDTO;
import com.quiz.backend.service.ResultService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/results")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResultController {

    private final ResultService resultService;

    public AdminResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<AdminResultResponseDTO>> getResults(
            @RequestParam(required = false) Long quizId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int pageNum = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        return ResponseEntity.ok(resultService.getFilteredResults(quizId, search, PageRequest.of(pageNum, pageSize)));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportResults(
            @RequestParam(required = false) Long quizId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> columns) {
        byte[] excelBytes = resultService.exportResultsToExcel(quizId, search, columns);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("quiz-results.xlsx").build());

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<AdminResultResponseDTO>> getResultsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(resultService.getResultsByQuiz(quizId));
    }

    @PostMapping("/{resultId}/approve-retake")
    public ResponseEntity<AdminResultResponseDTO> approveRetake(@PathVariable Long resultId) {
        return ResponseEntity.ok(resultService.approveRetake(resultId));
    }
}

