import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FocusMode from '../components/FocusMode';

const Home = () => {
  const { currentUser } = useAuth();
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  const features = [
    {
      icon: 'fa-book-reader',
      title: 'Curated Courses',
      description: 'Access high-quality video courses across various domains with structured learning paths designed by industry experts.'
    },
    {
      icon: 'fa-robot',
      title: 'AI Assistant',
      description: 'Get instant answers and explanations from your personal AI tutor available 24/7 to guide your learning journey.'
    },
    {
      icon: 'fa-clock',
      title: 'Focus Mode',
      description: 'Stay productive with built-in Pomodoro timers and focus tools to maximize your learning efficiency.'
    },
    {
      icon: 'fa-brain',
      title: 'Smart Learning',
      description: 'AI adapts to your learning style and pace, creating a personalized education experience just for you.'
    },
    {
      icon: 'fa-chart-line',
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics, achievements, and milestone tracking.'
    },
    {
      icon: 'fa-tasks',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with AI-generated quizzes across 10 different disciplines, complete with detailed explanations and performance tracking.'
    }
  ];



  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in-up">
              <i className="fas fa-sparkles"></i>
              <span>AI-Powered Learning Platform</span>
            </div>

            <h1 className="hero-title animate-fade-in-up delay-100">
              Master Any Skill with <span className="gradient-text">AI Tutoring</span>
            </h1>

            <p className="hero-subtitle animate-fade-in-up delay-200">
              Experience the future of education with personalized AI tutoring,
              curated courses, and smart learning tools tailored to your needs.
            </p>

            <div className="hero-actions animate-fade-in-up delay-300">
              <Link to="/courses" className="btn btn-primary btn-lg">
                <i className="fas fa-rocket"></i> Start Learning
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setIsFocusModeOpen(true)}
              >
                <i className="fas fa-brain"></i> Focus Mode
              </button>
            </div>
          </div>

          <div className="hero-visual animate-fade-in-scale delay-200">
            <div className="floating-card card-1">
              <div className="floating-card-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <span>Learn Smarter</span>
            </div>
            <div className="floating-card card-2">
              <div className="floating-card-icon">
                <i className="fas fa-robot"></i>
              </div>
              <span>AI Powered</span>
            </div>
            <div className="floating-card card-3">
              <div className="floating-card-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <span>Achieve Goals</span>
            </div>
            <div className="hero-center-icon">
              <i className="fas fa-robot"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose TutorAI?</h2>
            <p>Discover the features that make learning more effective, engaging, and enjoyable</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join thousands of learners who are already mastering new skills with AI-powered tutoring.</p>
            <div className="cta-actions">
              <Link to="/courses" className="btn btn-primary btn-lg">
                <i className="fas fa-play"></i> Get Started Free
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setIsFocusModeOpen(true)}
              >
                <i className="fas fa-clock"></i> Try Focus Mode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Mode Modal */}
      <FocusMode isOpen={isFocusModeOpen} onClose={() => setIsFocusModeOpen(false)} />
    </div>
  );
};

export default Home;
