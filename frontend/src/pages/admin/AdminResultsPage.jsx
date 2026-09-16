import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { ResultsTable } from '../../components/admin/ResultsTable';
import { getAllQuizzes, formatApiError } from '../../api/quizAdminApi';
import { getAllResults, getResultsByQuiz, approveRetake } from '../../api/resultAdminApi';

export const AdminResultsPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  // Load quizzes list for dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const qList = await getAllQuizzes();
        setQuizzes(qList || []);
      } catch (err) {
        console.error('Failed to load quizzes for filter', err);
      }
    };
    fetchQuizzes();
  }, []);

  // Fetch results based on selected quiz filter
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (selectedQuizId === 'all') {
        data = await getAllResults();
      } else {
        data = await getResultsByQuiz(selectedQuizId);
      }
      setResults(data || []);
    } catch (err) {
      setError(formatApiError(err, 'Failed to fetch student results.'));
    } finally {
      setLoading(false);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Client-side search filter by student name or email
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    const q = searchQuery.toLowerCase().trim();
    return results.filter(
      (r) =>
        r.studentName?.toLowerCase().includes(q) ||
        r.studentEmail?.toLowerCase().includes(q) ||
        r.quizTitle?.toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  // Aggregate stats
  const totalSubmissions = results.length;
  const avgPercentage = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sumPct = results.reduce((acc, r) => {
      const total = r.totalQuestions || 1;
      return acc + (r.score / total) * 100;
    }, 0);
    return Math.round(sumPct / totalSubmissions);
  }, [results, totalSubmissions]);

  const highestScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    return Math.max(...results.map((r) => r.score || 0));
  }, [results, totalSubmissions]);

  const handleApproveRetake = async (resultId) => {
    setApprovingId(resultId);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedResult = await approveRetake(resultId);
      setResults((prev) =>
        prev.map((r) => (r.resultId === resultId ? { ...r, retakeApproved: true } : r))
      );
      setSuccessMessage(`Retake approved successfully for ${updatedResult.studentName || 'student'}.`);
    } catch (err) {
      setError(formatApiError(err, 'Failed to approve retake.'));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <AdminNavbar />

      <main className="admin-main-content">
        <div className="section-header-bar">
          <div>
            <h3 className="section-heading">Assessment Results</h3>
            <p className="section-subheading">
              View student performance, score breakdowns, and manage retake permissions.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error alert-dismissible">
            <span>{error}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success alert-dismissible">
            <span>{successMessage}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Results Stats Banner */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-blue">📊</div>
            <div className="stat-info">
              <span className="stat-number">{totalSubmissions}</span>
              <span className="stat-title">Total Submissions</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-green">🎯</div>
            <div className="stat-info">
              <span className="stat-number">{avgPercentage}%</span>
              <span className="stat-title">Average Accuracy</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-purple">🏆</div>
            <div className="stat-info">
              <span className="stat-number">{highestScore}</span>
              <span className="stat-title">Top Score</span>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <div className="results-filter-card">
          <div className="filter-group">
            <label htmlFor="quiz-filter-select">Filter by Quiz</label>
            <select
              id="quiz-filter-select"
              className="form-control select-control"
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              disabled={loading}
            >
              <option value="all">All Quizzes ({quizzes.length})</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group flex-1">
            <label htmlFor="search-input">Search Student</label>
            <input
              id="search-input"
              type="text"
              className="form-control"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Table Section */}
        <div className="results-table-card">
          <ResultsTable
            results={filteredResults}
            loading={loading}
            onApproveRetake={handleApproveRetake}
            approvingId={approvingId}
          />
        </div>
      </main>
    </div>
  );
};
