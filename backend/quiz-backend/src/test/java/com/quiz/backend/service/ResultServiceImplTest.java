package com.quiz.backend.service;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.dto.PageResponseDTO;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.entity.Result;
import com.quiz.backend.entity.User;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResultServiceImplTest {

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private ResultServiceImpl resultService;

    private Result sampleResult;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(10L);
        user.setName("Test Student");
        user.setEmail("student@example.com");
        user.setRollNumber("ROLL-001");

        Quiz quiz = new Quiz();
        quiz.setId(100L);
        quiz.setTitle("Java Basics");

        sampleResult = new Result();
        sampleResult.setId(1L);
        sampleResult.setUser(user);
        sampleResult.setQuiz(quiz);
        sampleResult.setScore(8);
        sampleResult.setTotalQuestions(10);
        sampleResult.setSubmittedAt(LocalDateTime.of(2026, 9, 17, 10, 0));
        sampleResult.setRetakeApproved(false);
        sampleResult.setAttemptId(55L);
    }

    @Test
    void testGetFilteredResults_NoFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findAllByOrderBySubmittedAtDesc(pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(null, null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Test Student", response.getContent().get(0).getStudentName());
        assertEquals("student@example.com", response.getContent().get(0).getStudentEmail());
        assertEquals("Java Basics", response.getContent().get(0).getQuizTitle());
        assertEquals(55L, response.getContent().get(0).getAttemptId());
        verify(resultRepository, times(1)).findAllByOrderBySubmittedAtDesc(pageable);
        verifyNoMoreInteractions(resultRepository);
    }

    @Test
    void testGetFilteredResults_QuizOnly() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findByQuizIdOrderBySubmittedAtDesc(100L, pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(100L, null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(resultRepository, times(1)).findByQuizIdOrderBySubmittedAtDesc(100L, pageable);
        verifyNoMoreInteractions(resultRepository);
    }

    @Test
    void testGetFilteredResults_SearchOnly() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findBySearchOrderBySubmittedAtDesc("student", pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(null, "student", pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(resultRepository, times(1)).findBySearchOrderBySubmittedAtDesc("student", pageable);
        verifyNoMoreInteractions(resultRepository);
    }

    @Test
    void testGetFilteredResults_QuizAndSearch() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findByQuizIdAndSearchOrderBySubmittedAtDesc(100L, "student", pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(100L, "student", pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(resultRepository, times(1)).findByQuizIdAndSearchOrderBySubmittedAtDesc(100L, "student", pageable);
        verifyNoMoreInteractions(resultRepository);
    }

    @Test
    void testGetFilteredResults_BlankSearchTreatedAsNull() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findAllByOrderBySubmittedAtDesc(pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(null, "   ", pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(resultRepository, times(1)).findAllByOrderBySubmittedAtDesc(pageable);
        verifyNoMoreInteractions(resultRepository);
    }

    @Test
    void testGetFilteredResults_EmptyResult() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(resultRepository.findAllByOrderBySubmittedAtDesc(pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(null, null, pageable);

        assertNotNull(response);
        assertEquals(0, response.getContent().size());
        assertEquals(0, response.getTotalElements());
        assertEquals(0, response.getTotalPages());
        assertTrue(response.isLast());
    }

    @Test
    void testExportResultsToExcel_AllCombinationsGenerateValidWorkbook() throws Exception {
        // 1. No filters
        when(resultRepository.findAllByOrderBySubmittedAtDesc()).thenReturn(List.of(sampleResult));
        byte[] excel1 = resultService.exportResultsToExcel(null, null);
        assertValidExcel(excel1, 1);

        // 2. Quiz filter only
        when(resultRepository.findByQuizIdOrderBySubmittedAtDesc(100L)).thenReturn(List.of(sampleResult));
        byte[] excel2 = resultService.exportResultsToExcel(100L, null);
        assertValidExcel(excel2, 1);

        // 3. Search filter only
        when(resultRepository.findBySearchOrderBySubmittedAtDesc("student")).thenReturn(List.of(sampleResult));
        byte[] excel3 = resultService.exportResultsToExcel(null, "student");
        assertValidExcel(excel3, 1);

        // 4. Quiz + Search
        when(resultRepository.findByQuizIdAndSearchOrderBySubmittedAtDesc(100L, "student")).thenReturn(List.of(sampleResult));
        byte[] excel4 = resultService.exportResultsToExcel(100L, "student");
        assertValidExcel(excel4, 1);

        // 5. Blank search
        byte[] excel5 = resultService.exportResultsToExcel(null, "   ");
        assertValidExcel(excel5, 1);

        // 6. Empty results
        when(resultRepository.findAllByOrderBySubmittedAtDesc()).thenReturn(Collections.emptyList());
        byte[] excelEmpty = resultService.exportResultsToExcel(null, null);
        assertValidExcel(excelEmpty, 0);
    }

    private void assertValidExcel(byte[] bytes, int expectedDataRows) throws Exception {
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheetAt(0);
            assertNotNull(sheet);
            assertEquals("Quiz Results", sheet.getSheetName());

            var headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            assertEquals("Student Name", headerRow.getCell(0).getStringCellValue());
            assertEquals("Roll Number", headerRow.getCell(1).getStringCellValue());
            assertEquals("Student Email", headerRow.getCell(2).getStringCellValue());
            assertEquals("Quiz", headerRow.getCell(3).getStringCellValue());
            assertEquals("Marks", headerRow.getCell(4).getStringCellValue());
            assertEquals("Total Marks", headerRow.getCell(5).getStringCellValue());
            assertEquals("Percentage", headerRow.getCell(6).getStringCellValue());
            assertEquals("Submitted At", headerRow.getCell(7).getStringCellValue());
            assertEquals("Retake Status", headerRow.getCell(8).getStringCellValue());
            assertEquals("Attempt ID", headerRow.getCell(9).getStringCellValue());

            if (expectedDataRows > 0) {
                var dataRow = sheet.getRow(1);
                assertNotNull(dataRow);
                assertEquals("Test Student", dataRow.getCell(0).getStringCellValue());
                assertEquals("ROLL-001", dataRow.getCell(1).getStringCellValue());
                assertEquals("student@example.com", dataRow.getCell(2).getStringCellValue());
                assertEquals("Java Basics", dataRow.getCell(3).getStringCellValue());
                assertEquals(8.0, dataRow.getCell(4).getNumericCellValue());
                assertEquals(10.0, dataRow.getCell(5).getNumericCellValue());
                assertEquals("80%", dataRow.getCell(6).getStringCellValue());
                assertEquals("17-Sep-2026 10:00:00 AM", dataRow.getCell(7).getStringCellValue());
                assertEquals("NOT APPROVED", dataRow.getCell(8).getStringCellValue());
                assertEquals("55", dataRow.getCell(9).getStringCellValue());
            }
        }
    }

    @Test
    void testExportResultsToExcel_CustomColumns() throws Exception {
        when(resultRepository.findAllByOrderBySubmittedAtDesc()).thenReturn(List.of(sampleResult));
        List<String> requested = List.of("studentName", "rollNumber", "marks", "submittedAt");
        byte[] bytes = resultService.exportResultsToExcel(null, null, requested);

        assertNotNull(bytes);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheetAt(0);
            var headerRow = sheet.getRow(0);
            assertEquals(4, headerRow.getLastCellNum());
            assertEquals("Student Name", headerRow.getCell(0).getStringCellValue());
            assertEquals("Roll Number", headerRow.getCell(1).getStringCellValue());
            assertEquals("Marks", headerRow.getCell(2).getStringCellValue());
            assertEquals("Submitted At", headerRow.getCell(3).getStringCellValue());

            var dataRow = sheet.getRow(1);
            assertEquals("Test Student", dataRow.getCell(0).getStringCellValue());
            assertEquals("ROLL-001", dataRow.getCell(1).getStringCellValue());
            assertEquals(8.0, dataRow.getCell(2).getNumericCellValue());
            assertEquals("17-Sep-2026 10:00:00 AM", dataRow.getCell(3).getStringCellValue());
        }
    }

    @Test
    void testExportResultsToExcel_PreservesColumnOrderRegardlessOfInputOrder() throws Exception {
        when(resultRepository.findAllByOrderBySubmittedAtDesc()).thenReturn(List.of(sampleResult));
        // Input order is reversed: submittedAt, marks, studentName
        List<String> requested = List.of("submittedAt", "marks", "studentName");
        byte[] bytes = resultService.exportResultsToExcel(null, null, requested);

        assertNotNull(bytes);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheetAt(0);
            var headerRow = sheet.getRow(0);
            assertEquals(3, headerRow.getLastCellNum());
            // Must follow predefined order: Student Name, Marks, Submitted At
            assertEquals("Student Name", headerRow.getCell(0).getStringCellValue());
            assertEquals("Marks", headerRow.getCell(1).getStringCellValue());
            assertEquals("Submitted At", headerRow.getCell(2).getStringCellValue());
        }
    }

    @Test
    void testExportResultsToExcel_EmptyColumns_ThrowsBadRequest() {
        List<String> emptyList = Collections.emptyList();
        // Passing an empty list should either default or if user explicitly provides empty/whitespace list that resolves to empty
        // When user explicitly selects 0 valid columns, e.g. ["unknown1", "unknown2"]
        List<String> invalidColumns = List.of("invalidKey1", "invalidKey2");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                resultService.exportResultsToExcel(null, null, invalidColumns)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Select at least one column"));
    }

    @Test
    void testMapToAdminResultResponseDTO_PopulatesRollNumberAndMarks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Result> page = new PageImpl<>(List.of(sampleResult), pageable, 1);
        when(resultRepository.findAllByOrderBySubmittedAtDesc(pageable)).thenReturn(page);

        PageResponseDTO<AdminResultResponseDTO> response = resultService.getFilteredResults(null, null, pageable);
        AdminResultResponseDTO dto = response.getContent().get(0);

        assertEquals("ROLL-001", dto.getRollNumber());
        assertEquals(8, dto.getMarks());
        assertEquals(10, dto.getTotalMarks());
        assertEquals(8, dto.getScore());
        assertEquals(10, dto.getTotalQuestions());
    }
}
