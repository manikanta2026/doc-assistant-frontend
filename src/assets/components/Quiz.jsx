import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Quiz.module.css';

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [questions, setQuestions] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState({});

    const parseQuizData = useCallback((quizText) => {
        const lines = quizText.split('\n');
        const questions = [];
        let currentQuestion = null;
        let options = [];
        let optionTexts = {};
        let correctAnswer = null;
        const correctAnswersMap = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith("Question:")) {
                if (currentQuestion) {
                    questions.push({ question: currentQuestion, options: options.slice(), optionTexts: { ...optionTexts } });
                    correctAnswersMap[currentQuestion] = correctAnswer;
                }
                currentQuestion = line;
                options = [];
                optionTexts = {};
                correctAnswer = null;
            } else if (line.match(/^[A-D]\)/)) {
                const opt = line.substring(0, 1);
                options.push(opt);
                optionTexts[opt] = line.substring(3).trim();
            } else if (line.startsWith("Correct Answer:")) {
                correctAnswer = line.split(':')[1].trim();
            }
        }

        if (currentQuestion) {
            questions.push({ question: currentQuestion, options: options, optionTexts: optionTexts });
            correctAnswersMap[currentQuestion] = correctAnswer;
        }
        return { questions, correctAnswers: correctAnswersMap };
    }, []);

    useEffect(() => {
        let quizRaw = '';
        if (location.state && (location.state.quizData || location.state.quiz)) {
            quizRaw = location.state.quizData || location.state.quiz;
        }
        if (typeof quizRaw === 'string') {
            try {
                const parsed = JSON.parse(quizRaw);
                if (parsed && typeof parsed === 'object' && parsed.quiz) {
                    quizRaw = parsed.quiz;
                }
            } catch {
                // Not JSON, use as is
            }
        }
        if (typeof quizRaw === 'string' && quizRaw.trim().length > 0 && !quizRaw.includes("Quiz generation failed")) {
            setQuiz(quizRaw);
        } else {
            setQuiz('');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (quiz) {
            const { questions: parsedQuestions, correctAnswers: parsedCorrectAnswers } = parseQuizData(quiz);
            setQuestions(parsedQuestions);
            setCorrectAnswers(parsedCorrectAnswers);
        }
    }, [quiz, parseQuizData]);

    const handleQuizSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        setSubmitted(false);
        setUserAnswers({});
        setScore(null);

        try {
            // No file upload needed, just display quiz
            setIsLoading(false);
        } catch (error) {
            setError('Failed to generate quiz.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (question, answer) => {
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [question]: answer,
        }));
    };

    const calculateScore = () => {
        let correctCount = 0;
        for (const q in userAnswers) {
            if (correctAnswers[q] === userAnswers[q]) {
                correctCount++;
            }
        }

        setScore(correctCount);
        setSubmitted(true);
    };

    const getAnswerClass = (question, option) => {
        if (!submitted) return styles.quizOption;
        const isCorrect = correctAnswers[question] === option;
        const isSelected = userAnswers[question] === option;

        if (isCorrect) {
            return `${styles.quizOption} ${styles.quizOptionCorrect}`;
        } else if (isSelected) {
            return `${styles.quizOption} ${styles.quizOptionWrong}`;
        } else {
            return styles.quizOption;
        }
    };

    const renderQuiz = () => {
        return questions.map((q, index) => (
            <div key={index} className={styles.quizQuestion}>
                <div className={styles.quizQuestionTitle}>
                    <span className={styles.quizQuestionNumber}>
                        Q{index + 1}.
                    </span> {q.question.replace('Question:', '').trim()}
                </div>
                <div className={styles.quizOptions}>
                    {q.options.map(option => (
                        <label key={option}
                            className={getAnswerClass(q.question, option)}
                            style={{ cursor: submitted ? 'default' : 'pointer' }}
                        >
                            <input
                                type="radio"
                                name={q.question}
                                value={option}
                                checked={userAnswers[q.question] === option}
                                onChange={() => handleAnswerChange(q.question, option)}
                                disabled={submitted}
                                className={styles.quizRadio}
                            />
                            <span>{option}) {q.optionTexts[option]}</span>
                        </label>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <section className={styles.quizSection}>
            {error && (
                <div className={styles.quizError}>
                    {error}
                </div>
            )}
            {!quiz ? (
                <div className={styles.quizError}>
                    No quiz data found. Please generate a quiz from the home page.
                </div>
            ) : (
                <div className={styles.quizContainer}>
                    <div className={styles.quizInner}>
                        <h2 className={styles.quizTitle}>
                            <span className={styles.quizTitleGradient}>Quiz</span>
                        </h2>
                        <div className={styles.quizBoxCustom}>
                            {renderQuiz()}
                        </div>
                        {!submitted ? (
                            <button className={styles.quizBtn} onClick={calculateScore} disabled={isLoading}>
                                Submit Quiz
                            </button>
                        ) : (
                            <div className={`${styles.quizScore} ${score === 0 ? styles.quizScoreZero : ''}`}>
                                Your score: {score}
                            </div>
                        )}
                        <button className={styles.quizBtn + ' ' + styles.quizBackBtn} onClick={() => navigate('/')}>
                            Back to Home
                            </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Quiz;
