package com.quiz.backend.repository;

import com.quiz.backend.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUserId(Long userId);

    List<Result> findByQuizId(Long quizId);

    Optional<Result> findByUserIdAndQuizId(Long userId, Long quizId);

    Optional<Result> findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(Long userId, Long quizId);

    Optional<Result> findByAttemptId(Long attemptId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Result r WHERE r.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);

    // Filter combination 1: No filters
    Page<Result> findAllByOrderBySubmittedAtDesc(Pageable pageable);
    List<Result> findAllByOrderBySubmittedAtDesc();

    // Filter combination 2: Quiz ID filter only
    Page<Result> findByQuizIdOrderBySubmittedAtDesc(Long quizId, Pageable pageable);
    List<Result> findByQuizIdOrderBySubmittedAtDesc(Long quizId);

    // Filter combination 3: Search query filter only (student name or email)
    @Query("SELECT r FROM Result r WHERE LOWER(r.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.submittedAt DESC")
    Page<Result> findBySearchOrderBySubmittedAtDesc(@Param("search") String search, Pageable pageable);

    @Query("SELECT r FROM Result r WHERE LOWER(r.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.submittedAt DESC")
    List<Result> findBySearchOrderBySubmittedAtDesc(@Param("search") String search);

    // Filter combination 4: Quiz ID and search query filter
    @Query("SELECT r FROM Result r WHERE r.quiz.id = :quizId AND (LOWER(r.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY r.submittedAt DESC")
    Page<Result> findByQuizIdAndSearchOrderBySubmittedAtDesc(@Param("quizId") Long quizId, @Param("search") String search, Pageable pageable);

    @Query("SELECT r FROM Result r WHERE r.quiz.id = :quizId AND (LOWER(r.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY r.submittedAt DESC")
    List<Result> findByQuizIdAndSearchOrderBySubmittedAtDesc(@Param("quizId") Long quizId, @Param("search") String search);
}
