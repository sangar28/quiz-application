package com.quiz.backend.service;

import com.quiz.backend.dto.*;
import com.quiz.backend.entity.Question;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizRepository;
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

    public QuizAdminServiceImpl(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
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
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (!questions.isEmpty()) {
            questionRepository.deleteAll(questions);
        }

        quizRepository.delete(quiz);
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
