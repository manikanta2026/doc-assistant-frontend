import { useState } from 'react';
import axios from 'axios';
import copy from "./copy.svg";
import tick from "./tick.svg";
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const [summary, setSummary] = useState('');
  const [qa, setQa] = useState([]); 
  const [file, setFile] = useState(null);
  const [copied, setCopied] = useState('');
  const [summaryLevel, setSummaryLevel] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOCX, or PPTX file.");
      setFile(null);
      event.target.value = null;
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSummarySubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a valid file.");
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('summary_type', summaryLevel);

    try {
      const response = await axios.post('http://localhost:5000/summary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error uploading the file:', error);
      setError('Failed to get summary.');
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  const handleQaSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a valid file.");
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('summary_type', summaryLevel);

    try {
      const response = await axios.post('http://localhost:5000/qa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQa(response.data.qa || []);
    } catch (error) {
      console.error('Error uploading the file:', error);
      setError('Failed to get Q&A.');
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  const handleCopy = (text) => {
    if (text) {
      setCopied(text);
      navigator.clipboard.writeText(text);
      setTimeout(() => setCopied(''), 3000); 
    }
  };

  const handleQuizGenerate = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a valid file.");
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Navigate to quiz page with quiz data
      navigate('/quiz', { state: { quiz: response.data.quiz } });
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz.');
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}
      <div className={`flex flex-col w-full gap-2 ${isDisabled ? 'pointer-events-none' : ''}`}>
        <form className="relative flex flex-col items-center gap-2" onSubmit={handleSummarySubmit}>
          <input
            type="file"
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
            required
            className="file_input"
            disabled={isDisabled}
          />
          <div className="gap-container">
            <select
              value={summaryLevel}
              onChange={(e) => setSummaryLevel(e.target.value)}
              className="drop-down-menu"
              disabled={isDisabled}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <button type="submit" className="submit_btn" disabled={isDisabled}>
              Summarize
            </button>
            <button onClick={handleQaSubmit} className="submit_btn" disabled={isDisabled}>
              Generate Q&A
            </button>
            <button onClick={handleQuizGenerate} className="submit_btn" disabled={isDisabled}>
              Generate Quiz
            </button>
          </div>
        </form>
      </div>

      {isLoading && <div className="loader"></div>}

      <div className="my-5 max-w-full flex flex-col justify-center items-center">
        {summary ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-satoshi font-bold text-gray-600 text-base">
              <span className="blue_gradient">Summary</span>
            </h2>
            <div className="summary_box font-inter font-medium text-sm">
              <div dangerouslySetInnerHTML={{ __html: summary }} />
            </div>
            <div className="copy_btn" onClick={() => handleCopy(summary)}>
              <img
                src={copied === summary ? tick : copy}
                alt="copy_icon"
                className="svg-copy"
              />
            </div>
          </div>
        ) : (
          <p>No summary available.</p>
        )}

        {qa.length > 0 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-satoshi font-bold text-gray-600 text-base mt-5">
              <span className="blue_gradient">Q&A</span>
            </h2>
            <div className="summary_box font-inter font-medium text-sm">
              <div dangerouslySetInnerHTML={{ __html: qa }} />
            </div>
            <div className="copy_btn" onClick={() => handleCopy(qa)}>
              <img
                src={copied === qa ? tick : copy}
                alt="copy_icon"
                className="svg-copy"
              />
            </div>
          </div>
        ) : (
          <p>No Q&A available.</p>
        )}
      </div>
    </section>
  );
};

export default Demo;
