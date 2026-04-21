import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages.css'; // Reusing some base styles for layout

// We can define the categories based on existing courses
const QUIZ_CATEGORIES = [
    { id: 'python', title: 'Python Programming', icon: 'fa-python', color: '#3776AB' },
    { id: 'dsa', title: 'Data Structures & Algorithms', icon: 'fa-project-diagram', color: '#10B981' },
    { id: 'web-dev', title: 'Web Development', icon: 'fa-globe', color: '#F59E0B' },
    { id: 'dbms', title: 'Database Management Systems', icon: 'fa-database', color: '#6366F1' },
    { id: 'oop', title: 'Object-Oriented Programming', icon: 'fa-cubes', color: '#EC4899' },
    { id: 'ai-ml', title: 'AI & Machine Learning', icon: 'fa-brain', color: '#8B5CF6' },
    { id: 'data-science', title: 'Data Science & Analytics', icon: 'fa-chart-pie', color: '#14B8A6' },
    { id: 'cybersecurity', title: 'Cybersecurity & Ethical Hacking', icon: 'fa-shield-alt', color: '#EF4444' },
    { id: 'os-networks', title: 'Operating Systems & Networks', icon: 'fa-network-wired', color: '#64748B' },
    { id: 'mobile-dev', title: 'Mobile App Development', icon: 'fa-mobile-alt', color: '#0EA5E9' }
];

interface QuizQuestion {
    id: number;
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation: string;
}

const Quizzes: React.FC = () => {
    const { currentUser } = useAuth();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isFinished, setIsFinished] = useState(false);

    const startQuiz = async (courseId: string) => {
        if (!currentUser) return;

        setSelectedCategory(courseId);
        setLoading(true);
        setError(null);
        setQuestions([]);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setIsFinished(false);

        try {
            const response = await fetch(`/api/courses/${courseId}/quiz/?user_uid=${currentUser.uid}`);
            const data = await response.json();

            if (response.ok) {
                setQuestions(data.questions);
            } else {
                setError(data.error || 'Failed to fetch quiz questions');
            }
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError('An error occurred while loading the quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: number, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correct_option) {
                score++;
            }
        });
        return score;
    };

    const handleFinishQuiz = async () => {
        setIsFinished(true);
        if (currentUser && selectedCategory) {
            const score = calculateScore();
            fetch('/api/stats/quiz/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_uid: currentUser.uid,
                    course_id: selectedCategory,
                    score: score,
                    total_questions: questions.length
                })
            }).catch(err => console.error("Failed to save quiz result", err));
        }
    };

    // If user is not logged in, prompt them
    if (!currentUser) {
        return (
            <div className="courses-page">
                <div className="courses-header">
                    <div className="courses-header-content">
                        <h1>Test Your Knowledge</h1>
                        <p>Take interactive quizzes to validate your learning progress.</p>
                    </div>
                </div>
                <div className="empty-state" style={{ marginTop: '2rem' }}>
                    <i className="fas fa-lock"></i>
                    <h3>Login Required</h3>
                    <p>You need to be logged in to take quizzes and track your scores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-page">
            <div className="courses-header">
                <div className="courses-header-content">
                    <h1>Course Quizzes</h1>
                    <p>Challenge yourself with 20 random questions from your chosen course.</p>
                </div>
            </div>

            <div className="courses-content">
                {!selectedCategory ? (
                    // Category Selection View
                    <div className="courses-list">
                        {QUIZ_CATEGORIES.map(category => (
                            <div key={category.id} className="course-card">
                                <div
                                    className="course-image"
                                    style={{ background: `linear-gradient(135deg, ${category.color}CC, ${category.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <i className={`fas ${category.icon}`} style={{ fontSize: '3rem', color: 'white' }}></i>
                                </div>
                                <div className="course-info">
                                    <h3>{category.title}</h3>
                                    <p>20 random questions to test your proficiency.</p>
                                    <div className="course-stats" style={{ marginTop: '1rem', borderTop: 'none', padding: 0 }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => startQuiz(category.id)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                                        >
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Active Quiz / Results View
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                        >
                            <i className="fas fa-arrow-left"></i> Back to Categories
                        </button>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <div style={{ flex: '1 1 600px', minWidth: 0 }}>

                                {loading && (
                                    <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <h3>Loading Quiz...</h3>
                                        <p>Generating your random set of 20 questions.</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                        <i className="fas fa-exclamation-circle" style={{ color: 'var(--accent-primary)' }}></i>
                                        <h3>Error</h3>
                                        <p>{error}</p>
                                        <button className="btn-primary" onClick={() => startQuiz(selectedCategory)} style={{ marginTop: '1rem' }}>
                                            Try Again
                                        </button>
                                    </div>
                                )}

                                {!loading && !error && questions.length > 0 && !isFinished && (
                                    <div className="quiz-container" style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Question {currentQuestionIndex + 1} of {questions.length}</h3>
                                            <span style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                {QUIZ_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
                                            <div style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.25rem', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                                                {questions[currentQuestionIndex].text}
                                            </h2>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {['A', 'B', 'C', 'D'].map((opt) => {
                                                    const questionId = questions[currentQuestionIndex].id;
                                                    const isAnswered = !!userAnswers[questionId];
                                                    const userAnswer = userAnswers[questionId];
                                                    const isCorrectAnswer = questions[currentQuestionIndex].correct_option === opt;
                                                    const isUserChoice = userAnswer === opt;

                                                    let bgColor = 'var(--bg-secondary)';
                                                    let borderColor = 'transparent';
                                                    let textColor = 'var(--text-primary)';
                                                    let iconBg = 'var(--bg-card)';
                                                    let iconColor = 'var(--text-secondary)';

                                                    if (isAnswered) {
                                                        if (isCorrectAnswer) {
                                                            bgColor = 'rgba(16, 185, 129, 0.1)';
                                                            borderColor = '#10B981';
                                                            iconBg = '#10B981';
                                                            iconColor = 'white';
                                                        } else if (isUserChoice && !isCorrectAnswer) {
                                                            bgColor = 'rgba(239, 68, 68, 0.1)';
                                                            borderColor = '#EF4444';
                                                            iconBg = '#EF4444';
                                                            iconColor = 'white';
                                                        }
                                                    } else if (isUserChoice) {
                                                        // This shouldn't really happen since state updates immediately 
                                                        // and locks the question, but just in case.
                                                        bgColor = 'rgba(99, 102, 241, 0.1)';
                                                        borderColor = 'var(--primary-color)';
                                                        iconBg = 'var(--primary-color)';
                                                        iconColor = 'white';
                                                    }

                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => !isAnswered && handleAnswerSelect(questionId, opt)}
                                                            disabled={isAnswered}
                                                            style={{
                                                                padding: '1rem 1.5rem',
                                                                textAlign: 'left',
                                                                background: bgColor,
                                                                border: `2px solid ${borderColor}`,
                                                                borderRadius: '12px',
                                                                color: textColor,
                                                                fontSize: '1rem',
                                                                cursor: isAnswered ? 'default' : 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '1rem',
                                                                opacity: isAnswered && !isCorrectAnswer && !isUserChoice ? 0.6 : 1
                                                            }}
                                                        >
                                                            <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, color: iconColor, borderRadius: '50%', fontWeight: 'bold', fontSize: '0.875rem', flexShrink: 0 }}>
                                                                {opt}
                                                            </span>
                                                            {questions[currentQuestionIndex][`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {!!userAnswers[questions[currentQuestionIndex].id] && (
                                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                                                    <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explanation</h5>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                                        {questions[currentQuestionIndex].explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                                disabled={currentQuestionIndex === 0}
                                                style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                                            >
                                                Previous
                                            </button>

                                            {currentQuestionIndex < questions.length - 1 ? (
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                                >
                                                    Next Question
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-primary"
                                                    style={{ background: '#10B981' }}
                                                    onClick={handleFinishQuiz}
                                                    disabled={Object.keys(userAnswers).length < questions.length}
                                                >
                                                    Submit Quiz
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!loading && !error && isFinished && (
                                    <div className="quiz-results" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '3rem 2rem', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Quiz Complete!</h2>
                                            <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                                                {calculateScore()}<span style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>/{questions.length}</span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                                You scored {Math.round((calculateScore() / questions.length) * 100)}%
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                                <button className="btn-secondary" onClick={() => setSelectedCategory(null)}>Back to Categories</button>
                                                <button className="btn-primary" onClick={() => startQuiz(selectedCategory)}>Retake Quiz (Randomized)</button>
                                            </div>
                                        </div>

                                        {/* Review section */}
                                        <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>Review Answers</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {questions.map((q, idx) => {
                                                const isCorrect = userAnswers[q.id] === q.correct_option;
                                                return (
                                                    <div key={q.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1.5rem', border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, borderLeft: `6px solid ${isCorrect ? '#10B981' : '#EF4444'}` }}>
                                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: isCorrect ? '#10B981' : '#EF4444', color: 'white', flexShrink: 0 }}>
                                                                <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'}`} style={{ fontSize: '0.8rem' }}></i>
                                                            </span>
                                                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{idx + 1}. {q.text}</h4>
                                                        </div>

                                                        <div style={{ marginLeft: '44px', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                            {['A', 'B', 'C', 'D'].map((opt) => {
                                                                const isUserSelection = userAnswers[q.id] === opt;
                                                                const isActualCorrect = q.correct_option === opt;

                                                                let bgColor = 'var(--bg-secondary)';
                                                                let borderColor = 'transparent';

                                                                if (isActualCorrect) {
                                                                    bgColor = 'rgba(16, 185, 129, 0.1)';
                                                                    borderColor = '#10B981';
                                                                } else if (isUserSelection && !isActualCorrect) {
                                                                    bgColor = 'rgba(239, 68, 68, 0.1)';
                                                                    borderColor = '#EF4444';
                                                                }

                                                                return (
                                                                    <div key={opt} style={{ padding: '0.75rem 1rem', background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{opt}:</span>
                                                                        {q[`option_${opt.toLowerCase()}` as keyof QuizQuestion]}
                                                                        {isUserSelection && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isCorrect ? '#10B981' : '#EF4444', fontWeight: 600 }}>Your Answer</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div style={{ marginLeft: '44px', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                                                            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explanation</h5>
                                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{q.explanation}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div> {/* End main quiz area */}

                            {/* Sidebar Area */}
                            {!loading && !error && questions.length > 0 && !isFinished && (
                                <div style={{ flex: '0 0 300px', width: '100%', background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', position: 'sticky', top: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Quiz Navigation</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                                        {questions.map((q, idx) => {
                                            const isAnswered = !!userAnswers[q.id];

                                            let bgColor = 'var(--bg-secondary)';
                                            let textColor = 'var(--text-primary)';
                                            let borderColor = 'transparent';

                                            if (isAnswered) {
                                                bgColor = 'rgba(16, 185, 129, 0.1)';
                                                textColor = '#10B981';
                                                borderColor = '#10B981';
                                            }
                                            if (currentQuestionIndex === idx) {
                                                borderColor = 'var(--primary-color)';
                                                if (!isAnswered) textColor = 'var(--primary-color)';
                                            }

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => setCurrentQuestionIndex(idx)}
                                                    style={{
                                                        aspectRatio: '1',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: bgColor,
                                                        border: `2px solid ${borderColor}`,
                                                        borderRadius: '8px',
                                                        color: textColor,
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {idx + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10B981' }}></div>
                                            <span>Attempted</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--primary-color)' }}></div>
                                            <span>Current</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid transparent' }}></div>
                                            <span>Not Attempted</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
