package com.quiz.backend.service;

import com.quiz.backend.dto.ExcelUploadResponseDTO;
import com.quiz.backend.entity.Question;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelQuestionImportServiceImpl implements ExcelQuestionImportService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public ExcelQuestionImportServiceImpl(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    @Transactional
    public ExcelUploadResponseDTO importQuestions(Long quizId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".xlsx")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only .xlsx Excel files are supported");
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        List<Question> newQuestions = parseAndValidateExcel(quiz, file);

        if (newQuestions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Excel file contains no question rows");
        }

        List<Question> existingQuestions = questionRepository.findByQuizId(quizId);
        if (!existingQuestions.isEmpty()) {
            questionRepository.deleteAll(existingQuestions);
        }

        questionRepository.saveAll(newQuestions);

        return new ExcelUploadResponseDTO("Questions uploaded successfully", quizId, newQuestions.size());
    }

    private List<Question> parseAndValidateExcel(Quiz quiz, MultipartFile file) {
        List<Question> questions = new ArrayList<>();
        DataFormatter dataFormatter = new DataFormatter();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Excel workbook contains no sheets");
            }

            int headerRowNum = -1;
            int questionCol = -1;
            int optionACol = -1;
            int optionBCol = -1;
            int optionCCol = -1;
            int optionDCol = -1;
            int answerCol = -1;

            for (int r = 0; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }

                int tempQuestion = -1;
                int tempOptionA = -1;
                int tempOptionB = -1;
                int tempOptionC = -1;
                int tempOptionD = -1;
                int tempAnswer = -1;

                for (int c = 0; c < row.getLastCellNum(); c++) {
                    Cell cell = row.getCell(c);
                    String headerVal = cleanString(dataFormatter.formatCellValue(cell));

                    if (headerVal.equalsIgnoreCase("question")) {
                        tempQuestion = c;
                    } else if (headerVal.equalsIgnoreCase("option a") || headerVal.equalsIgnoreCase("optiona")) {
                        tempOptionA = c;
                    } else if (headerVal.equalsIgnoreCase("option b") || headerVal.equalsIgnoreCase("optionb")) {
                        tempOptionB = c;
                    } else if (headerVal.equalsIgnoreCase("option c") || headerVal.equalsIgnoreCase("optionc")) {
                        tempOptionC = c;
                    } else if (headerVal.equalsIgnoreCase("option d") || headerVal.equalsIgnoreCase("optiond")) {
                        tempOptionD = c;
                    } else if (headerVal.equalsIgnoreCase("answer") || headerVal.equalsIgnoreCase("correct option") || headerVal.equalsIgnoreCase("correct answer")) {
                        tempAnswer = c;
                    }
                }

                if (tempQuestion >= 0 && tempOptionA >= 0 && tempOptionB >= 0 &&
                        tempOptionC >= 0 && tempOptionD >= 0 && tempAnswer >= 0) {
                    headerRowNum = r;
                    questionCol = tempQuestion;
                    optionACol = tempOptionA;
                    optionBCol = tempOptionB;
                    optionCCol = tempOptionC;
                    optionDCol = tempOptionD;
                    answerCol = tempAnswer;
                    break;
                }
            }

            if (headerRowNum < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Could not locate valid header row. Expected columns: Question, Option A, Option B, Option C, Option D, Answer");
            }

            for (int r = headerRowNum + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }

                String questionText = cleanString(dataFormatter.formatCellValue(row.getCell(questionCol)));
                String optionA = cleanString(dataFormatter.formatCellValue(row.getCell(optionACol)));
                String optionB = cleanString(dataFormatter.formatCellValue(row.getCell(optionBCol)));
                String optionC = cleanString(dataFormatter.formatCellValue(row.getCell(optionCCol)));
                String optionD = cleanString(dataFormatter.formatCellValue(row.getCell(optionDCol)));
                String answer = cleanString(dataFormatter.formatCellValue(row.getCell(answerCol)));

                boolean isRowEmpty = questionText.isEmpty() && optionA.isEmpty() && optionB.isEmpty()
                        && optionC.isEmpty() && optionD.isEmpty() && answer.isEmpty();

                if (isRowEmpty) {
                    continue;
                }

                int excelRowNumber = r + 1;

                if (questionText.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Question must not be blank");
                }
                if (optionA.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Option A must not be blank");
                }
                if (optionB.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Option B must not be blank");
                }
                if (optionC.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Option C must not be blank");
                }
                if (optionD.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Option D must not be blank");
                }

                String upperAnswer = answer.toUpperCase();
                if (!upperAnswer.matches("^[ABCD]$")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid Excel row " + excelRowNumber + ": Answer must be A, B, C, or D");
                }

                Question question = new Question();
                question.setQuiz(quiz);
                question.setQuestionText(questionText);
                question.setOptionA(optionA);
                question.setOptionB(optionB);
                question.setOptionC(optionC);
                question.setOptionD(optionD);
                question.setCorrectOption(upperAnswer);

                questions.add(question);
            }

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse Excel file: " + e.getMessage(), e);
        }

        return questions;
    }

    private String cleanString(String input) {
        return input == null ? "" : input.trim();
    }
}
