package com.quiz.backend.service;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.entity.Result;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                result.isRetakeApproved()
        );
    }
}
