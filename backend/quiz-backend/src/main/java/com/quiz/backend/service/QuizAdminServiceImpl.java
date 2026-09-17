package com.quiz.backend.service;

import com.quiz.backend.dto.*;
import com.quiz.backend.entity.Question;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizAttemptRepository;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizAdminServiceImpl implements QuizAdminService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizAdminServiceImpl(QuizRepository quizRepository,
                                QuestionRepository questionRepository,
                                ResultRepository resultRepository,
                                QuizAttemptRepository quizAttemptRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    @Override
    public AdminQuizResponseDTO createQuiz(CreateQuizRequestDTO request) {
        Quiz quiz = new Quiz(request.getTitle(), request.getDescription(), request.getDurationMinutes());
        quiz.setActive(false);
        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToAdminQuizResponseDTO(savedQuiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuizResponseDTO> getAllQuizzes() {
        return quizRepository.findAll()
                .stream()
                .map(this::mapToAdminQuizResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AdminQuizResponseDTO updateQuiz(Long quizId, UpdateQuizRequestDTO request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setShowScore(request.isShowScore());
        quiz.setShowCorrectAnswers(request.isShowCorrectAnswers());
        quiz.setActive(request.isActive());
        quiz.setAllowCopy(request.isAllowCopy());
        quiz.setAllowPaste(request.isAllowPaste());
        quiz.setAllowRightClick(request.isAllowRightClick());
        quiz.setDetectTabSwitch(request.isDetectTabSwitch());
        quiz.setAutoSubmitOnViolation(request.isAutoSubmitOnViolation());
        if (request.getViolationThreshold() != null) {
            if (request.getViolationThreshold() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "violationThreshold must be greater than 0");
            }
            quiz.setViolationThreshold(request.getViolationThreshold());
        }
        quiz.setAllowPreviousQuestion(request.isAllowPreviousQuestion());
        quiz.setRandomQuestions(request.isRandomQuestions());
        quiz.setRandomOptions(request.isRandomOptions());
        quiz.setImmediateResult(request.isImmediateResult());

        Quiz updatedQuiz = quizRepository.save(quiz);
        return mapToAdminQuizResponseDTO(updatedQuiz);
    }

    @Override
    public void deleteQuiz(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId);
        }

        try {
            // 1. Delete Result records belonging to the quiz
            resultRepository.deleteByQuizId(quizId);

            // 2. Delete QuizAttempt records belonging to the quiz
            quizAttemptRepository.deleteByQuizId(quizId);

            // 3. Delete Question records belonging to the quiz
            questionRepository.deleteByQuizId(quizId);

            // 4. Delete the Quiz itself
            quizRepository.deleteById(quizId);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to safely delete quiz: " + ex.getMessage(), ex);
        }
    }

    @Override
    public AdminQuestionResponseDTO addQuestion(Long quizId, CreateQuestionRequestDTO request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectOption(request.getCorrectOption().trim().toUpperCase());

        Question savedQuestion = questionRepository.save(question);
        return mapToAdminQuestionResponseDTO(savedQuestion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuestionResponseDTO> getQuizQuestions(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId);
        }

        return questionRepository.findByQuizId(quizId)
                .stream()
                .map(this::mapToAdminQuestionResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<AdminQuestionResponseDTO> getQuizQuestionsPaged(Long quizId, Pageable pageable) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId);
        }

        Page<Question> questionPage = questionRepository.findByQuizId(quizId, pageable);
        Page<AdminQuestionResponseDTO> dtoPage = questionPage.map(this::mapToAdminQuestionResponseDTO);
        return PageResponseDTO.from(dtoPage);
    }

    @Override
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found with id: " + questionId));

        questionRepository.delete(question);
    }

    private AdminQuizResponseDTO mapToAdminQuizResponseDTO(Quiz quiz) {
        return new AdminQuizResponseDTO(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getDurationMinutes(),
                quiz.isActive(),
                quiz.isShowScore(),
                quiz.isShowCorrectAnswers(),
                quiz.isAllowCopy(),
                quiz.isAllowPaste(),
                quiz.isAllowRightClick(),
                quiz.isDetectTabSwitch(),
                quiz.isAutoSubmitOnViolation(),
                quiz.getViolationThreshold(),
                quiz.isAllowPreviousQuestion(),
                quiz.isRandomQuestions(),
                quiz.isRandomOptions(),
                quiz.isImmediateResult()
        );
    }

    private AdminQuestionResponseDTO mapToAdminQuestionResponseDTO(Question question) {
        return new AdminQuestionResponseDTO(
                question.getId(),
                question.getQuiz() != null ? question.getQuiz().getId() : null,
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getCorrectOption()
        );
    }
}
