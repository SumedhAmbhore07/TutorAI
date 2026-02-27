import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Course data matching the original Django template
interface Topic {
  id: string;
  title: string;
  videoId: string;
}

interface CourseData {
  id: string;
  title: string;
  topics: Topic[];
}

const courseData: CourseData[] = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    topics: [
      { id: 'dsa-intro', title: 'Introduction to DSA', videoId: 'RBSGKlAvoiM' },
      { id: 'dsa-arrays', title: 'Arrays & Strings', videoId: '4u8X9S-o_I8' },
      { id: 'dsa-ll', title: 'Linked Lists', videoId: 'Hj_r_6-I_9o' },
      { id: 'dsa-stacks', title: 'Stacks & Queues', videoId: 'I5lq6sCuABE' },
      { id: 'dsa-trees', title: 'Binary Trees', videoId: 'oSWTXtMglKE' },
      { id: 'dsa-graphs', title: 'Graph Algorithms', videoId: 'tWVWeAqZ0WU' },
      { id: 'dsa-sorting', title: 'Sorting & Searching', videoId: '8hly31xKli0' }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    topics: [
      { id: 'web-html', title: 'HTML5 & Semantic Web', videoId: 'DPnmb7Wcnm0' },
      { id: 'web-css', title: 'CSS3 & Flexbox/Grid', videoId: '1PnVor36_40' },
      { id: 'web-js', title: 'JavaScript Fundamentals', videoId: 'W6NZfCO5SIk' },
      { id: 'web-react', title: 'React.js Basics', videoId: 'bMknfKXIFA8' },
      { id: 'web-node', title: 'Node.js & Express', videoId: 'Oe421EPjeBE' },
      { id: 'web-responsive', title: 'Responsive Design', videoId: 'srvUrASNj0s' }
    ]
  },
  {
    id: 'python',
    title: 'Python Programming',
    topics: [
      { id: 'py-intro', title: 'Python Introduction', videoId: 'rfscVS0vtbw' },
      { id: 'py-data', title: 'Data Types & Variables', videoId: 'DWgzHbVlS7A' },
      { id: 'py-funcs', title: 'Functions & Modules', videoId: '9Os0o3wzS_I' },
      { id: 'py-oop', title: 'OOP in Python', videoId: 'ZDa-Z5JzLYM' },
      { id: 'py-pandas', title: 'Data Analysis with Pandas', videoId: 'dcqPhpY7huo' }
    ]
  },
  {
    id: 'dbms',
    title: 'Database Management Systems',
    topics: [
      { id: 'db-intro', title: 'Introduction to DBMS', videoId: 'HXV3zeQKqGY' },
      { id: 'db-relational', title: 'Relational Model & Keys', videoId: '86pY_iE7X3w' },
      { id: 'db-sql', title: 'SQL Queries', videoId: 'HXTUN4sa9kQ' },
      { id: 'db-normalized', title: 'Normalization', videoId: 'ABwD8G2mFos' },
      { id: 'db-nosql', title: 'Introduction to NoSQL', videoId: 'uD3p_rZ-pY' }
    ]
  },
  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    topics: [
      { id: 'oop-concepts', title: 'Core OOP Concepts', videoId: 'pTB0EiLXUC8' },
      { id: 'oop-java', title: 'OOP with Java', videoId: 'mAtkPQO1Fyo' },
      { id: 'oop-cpp', title: 'OOP with C++', videoId: 'V9m_onp_JAc' },
      { id: 'oop-design', title: 'Design Patterns', videoId: 'vNHpsC5M66A' }
    ]
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    topics: [
      { id: 'ai-intro', title: 'Artificial Intelligence Basics', videoId: 'ad79nYk2kEg' },
      { id: 'ml-types', title: 'Supervised vs Unsupervised', videoId: 'qfQsUaGat-Y' },
      { id: 'ml-python', title: 'ML with Scikit-Learn', videoId: '0Lt9w-RO8_M' },
      { id: 'dl-intro', title: 'Neural Networks & Deep Learning', videoId: 'aircAruvnKk' }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    topics: [
      { id: 'ds-intro', title: 'Introduction to Data Science', videoId: 'ua-CiDNNj30' },
      { id: 'ds-stats', title: 'Statistics for Data Science', videoId: 'Vfo5le26IhY' },
      { id: 'ds-viz', title: 'Data Visualization (Matplotlib/Seaborn)', videoId: '3U7Eks8_x-g' },
      { id: 'ds-sql', title: 'SQL for Data Science', videoId: '7S_tz1z_5bA' }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Ethical Hacking',
    topics: [
      { id: 'cyber-intro', title: 'Cyber Security for Beginners', videoId: 'nzj7Wg46lsA' },
      { id: 'cyber-net', title: 'Network Security', videoId: 'B_L4-0v_33w' },
      { id: 'cyber-hacking', title: 'Ethical Hacking 101', videoId: '3Kq1MIfTWCE' },
      { id: 'cyber-def', title: 'Defensive Security', videoId: '7_V7_eM0j0s' }
    ]
  },
  {
    id: 'os-networks',
    title: 'Operating Systems & Networks',
    topics: [
      { id: 'os-intro', title: 'Operating Systems Overview', videoId: 'mXw9ruZaxzQ' },
      { id: 'net-intro', title: 'Computer Networks Basics', videoId: 'qn3Z6-Sj7nE' },
      { id: 'os-process', title: 'Process Management', videoId: 'L8E_fI1pPMA' },
      { id: 'net-osi', title: 'The OSI Model', videoId: 'vv4y_uOneC0' }
    ]
  },
  {
    id: 'mobile-dev',
    title: 'Mobile App Development',
    topics: [
      { id: 'mob-intro', title: 'Intro to Mobile Development', videoId: 'X7_pM47HwIk' },
      { id: 'mob-flutter', title: 'Flutter Basics', videoId: 'VPvVD8t02U8' },
      { id: 'mob-react', title: 'React Native Crash Course', videoId: '0-S5a0eXPoc' },
      { id: 'mob-native', title: 'Android vs iOS Native', videoId: 'uXoAon4U84o' }
    ]
  }
];

const Courses = () => {
  const [searchParams] = useSearchParams();
  const initialCourse = searchParams.get('course');
  
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse || '');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('tutorai_course_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.lastCourse && !initialCourse) {
        setSelectedCourse(progress.lastCourse);
      }
      if (progress.lastTopic) {
        setSelectedTopic(progress.lastTopic);
      }
    }
  }, [initialCourse]);

  const currentCourse = courseData.find(c => c.id === selectedCourse);
  const currentTopic = currentCourse?.topics.find(t => t.id === selectedTopic);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSelectedTopic('');
    
    // Save progress
    const savedProgress = JSON.parse(localStorage.getItem('tutorai_course_progress') || '{}');
    localStorage.setItem('tutorai_course_progress', JSON.stringify({
      ...savedProgress,
      lastCourse: courseId,
      lastTopic: ''
    }));
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topicId = e.target.value;
    setSelectedTopic(topicId);
    
    // Save progress
    const savedProgress = JSON.parse(localStorage.getItem('tutorai_course_progress') || '{}');
    localStorage.setItem('tutorai_course_progress', JSON.stringify({
      ...savedProgress,
      lastCourse: selectedCourse,
      lastTopic: topicId
    }));
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    
    // Save progress
    const savedProgress = JSON.parse(localStorage.getItem('tutorai_course_progress') || '{}');
    localStorage.setItem('tutorai_course_progress', JSON.stringify({
      ...savedProgress,
      lastCourse: selectedCourse,
      lastTopic: topicId
    }));
    
    // Scroll to video on mobile
    if (window.innerWidth < 768) {
      const videoElement = document.getElementById('course-video');
      videoElement?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <h1>
          <i className="fas fa-play-circle"></i>
          Course Videos
        </h1>
      </div>

      <div className="courses-container">
        {/* Course Selector */}
        <div className="course-selector">
          <div className="selector-group">
            <label htmlFor="course-select">
              <i className="fas fa-book"></i>
              Select Course
            </label>
            <select 
              id="course-select" 
              value={selectedCourse}
              onChange={handleCourseChange}
            >
              <option value="">Choose a Course</option>
              {courseData.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selector-group" style={{ display: selectedCourse ? 'flex' : 'none' }}>
            <label htmlFor="topic-select">
              <i className="fas fa-list"></i>
              Select Subtopic
            </label>
            <select 
              id="topic-select"
              value={selectedTopic}
              onChange={handleTopicChange}
            >
              <option value="">Select a Topic</option>
              {currentCourse?.topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Cards */}
        {currentCourse && (
          <div className="course-slots-container">
            {currentCourse.topics.map(topic => (
              <div 
                key={topic.id}
                className={`topic-card ${selectedTopic === topic.id ? 'active' : ''}`}
                onClick={() => handleTopicClick(topic.id)}
              >
                <div className="topic-card-icon">
                  <i className="fas fa-play"></i>
                </div>
                <div className="topic-card-info">
                  <h4>{topic.title}</h4>
                  <span>Video Lesson</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Content */}
        <div className="courses-content">
          {!selectedCourse ? (
            <div className="text-center">
              <i className="fas fa-book-open" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
              <p>Please select a course and subtopic to view the lesson.</p>
            </div>
          ) : !selectedTopic ? (
            <div className="text-center">
              <i className="fas fa-hand-pointer" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
              <p>Please select a subtopic from the dropdown or click a card to start learning.</p>
            </div>
          ) : currentTopic ? (
            <div className="video-wrapper" id="course-video">
              <div className="video-header">
                <h3>
                  <i className="fas fa-play-circle"></i>
                  {currentTopic.title}
                </h3>
                <p>{currentCourse?.title}</p>
              </div>
              <div className="iframe-container">
                <iframe 
                  src={`https://www.youtube.com/embed/${currentTopic.videoId}`}
                  title={currentTopic.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Courses;
