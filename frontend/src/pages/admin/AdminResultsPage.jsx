import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { ResultsTable } from '../../components/admin/ResultsTable';
import { getAllQuizzes, formatApiError } from '../../api/quizAdminApi';
import { getAdminResults, exportResultsExcel, approveRetake } from '../../api/resultAdminApi';

export const AdminResultsPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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

  // Fetch paginated results based on filters and page
  const fetchResults = useCallback(
    async (pageToFetch = 0) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminResults({
          quizId: selectedQuizId,
          search: searchQuery,
          page: pageToFetch,
          size: 10,
        });
        const items = data?.content || [];
        setResults(items);
        setCurrentPage(data?.number ?? pageToFetch);
        setTotalPages(data?.totalPages ?? 1);
        setTotalSubmissions(data?.totalElements ?? items.length);
      } catch (err) {
        setError(formatApiError(err, 'Failed to fetch student results.'));
      } finally {
        setLoading(false);
      }
    },
    [selectedQuizId, searchQuery]
  );

  // Debounce search/filter changes and reset to page 0
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedQuizId, searchQuery, fetchResults]);

  // Aggregate stats from current results
  const avgPercentage = useMemo(() => {
    if (results.length === 0) return 0;
    const sumPct = results.reduce((acc, r) => {
      const total = r.totalQuestions || 1;
      return acc + (r.score / total) * 100;
    }, 0);
    return Math.round(sumPct / results.length);
  }, [results]);

  const highestScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.score || 0));
  }, [results]);

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

  const handleDownloadExcel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await exportResultsExcel({
        quizId: selectedQuizId,
        search: searchQuery,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz-results.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatApiError(err, 'Failed to download Excel file.'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <AdminNavbar />

      <main className="admin-main-content">
        <div className="section-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="section-heading">Assessment Results</h3>
            <p className="section-subheading">
              View student performance, score breakdowns, and manage retake permissions.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-excel-export"
            onClick={handleDownloadExcel}
            disabled={isExporting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isExporting ? (
              <span>Downloading...</span>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download Excel</span>
              </>
            )}
          </button>
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
              <span className="stat-title">Page Accuracy</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-purple">🏆</div>
            <div className="stat-info">
              <span className="stat-number">{highestScore}</span>
              <span className="stat-title">Page Top Score</span>
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
              disabled={loading && results.length === 0}
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
            results={results}
            loading={loading}
            onApproveRetake={handleApproveRetake}
            approvingId={approvingId}
          />

          {totalPages > 1 && (
            <div className="pagination-container" style={{ marginTop: '20px', padding: '12px 0' }}>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => fetchResults(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                &larr; Previous
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pagination-num ${i === currentPage ? 'pagination-num-active' : ''}`}
                    onClick={() => fetchResults(i)}
                    disabled={loading}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => fetchResults(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || loading}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

