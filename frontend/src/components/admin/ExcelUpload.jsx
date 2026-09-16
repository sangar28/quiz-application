import React, { useState, useRef } from 'react';
import { uploadQuestionsExcel, formatApiError } from '../../api/quizAdminApi';

export const ExcelUpload = ({ quizId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      setError('Please select a valid Excel (.xlsx) file.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setError(null);
    setMessage(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an .xlsx file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await uploadQuestionsExcel(quizId, selectedFile);
      const count = response.importedQuestions ?? 'Questions';
      setMessage(`${count} questions uploaded successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      setError(formatApiError(err, 'Failed to upload Excel file.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="excel-upload-container">
      <div className="excel-upload-main">
        <h4 className="section-title">Upload Questions from Excel</h4>

        <div className="alert alert-warning">
          <strong>Notice:</strong> Uploading a new Excel file will replace the existing questions for this quiz.
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form className="excel-upload-form" onSubmit={handleUpload}>
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              id="excel-file-input"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={uploading}
              className="file-input-hidden"
            />
            <label htmlFor="excel-file-input" className="file-dropzone">
              <span className="file-icon">📊</span>
              <span className="file-prompt">
                {selectedFile ? selectedFile.name : 'Choose Excel (.xlsx) file'}
              </span>
              <span className="file-subtext">Click to browse your device</span>
            </label>
          </div>

          <div className="excel-upload-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Questions'}
            </button>
            {selectedFile && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="excel-format-box">
        <h5>Excel Template Guide</h5>
        <p className="format-hint">
          The workbook must have these exact column headers in row 1:
        </p>

        <div className="format-table-wrap">
          <table className="format-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Option A</th>
                <th>Option B</th>
                <th>Option C</th>
                <th>Option D</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>What is JVM?</td>
                <td>Java Virtual Machine</td>
                <td>Java Variable Machine</td>
                <td>Java Visual Machine</td>
                <td>Joint Virtual Method</td>
                <td><span className="answer-code">A</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="format-rules">
          <li>Answer column must be strictly <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong>.</li>
          <li>All cells in a row must be non-empty.</li>
          <li>Only <strong>.xlsx</strong> files are supported.</li>
        </ul>
      </div>
    </div>
  );
};
