package com.quiz.backend.service;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizResponseDTO;
import com.quiz.backend.entity.Question;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public QuizServiceImpl(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public List<QuizResponseDTO> getActiveQuizzes() {
        return quizRepository.findByActiveTrue()
                .stream()
                .map(quiz -> new QuizResponseDTO(
                        quiz.getId(),
                        quiz.getTitle(),
                        quiz.getDescription(),
                        quiz.getDurationMinutes()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionResponseDTO> getQuizQuestions(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId);
        }

        List<Question> questions = questionRepository.findByQuizId(quizId);
        return questions.stream()
                .map(q -> new QuestionResponseDTO(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .collect(Collectors.toList());
    }
}
