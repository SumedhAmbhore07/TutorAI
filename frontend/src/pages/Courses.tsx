import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoInteraction from '../components/VideoInteraction';
import { useAuth } from '../contexts/AuthContext';

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

interface LocalVideo {
  id: string;
  courseId: string;
  topicId: string;
  fileName: string;
  videoUrl: string;
}

// Combined video type
interface VideoItem {
  id: string;
  type: 'youtube' | 'local';
  title: string;
  courseId: string;
  topicId: string;
  videoId?: string; // YouTube video ID
  videoUrl?: string; // Local video URL
  fileName?: string; // Local file name
  thumbnail?: string; // YouTube thumbnail
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCourse = searchParams.get('course');

  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse || '');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [allLocalVideos, setAllLocalVideos] = useState<LocalVideo[]>([]);
  const { currentUser } = useAuth();

  // Progression State
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

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

  // Fetch all local videos once on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos/');
        if (response.ok) {
          const data = await response.json();
          setAllLocalVideos(data.videos || []);
        }
      } catch (error) {
        console.error("Failed to fetch local videos", error);
      }
    };
    fetchVideos();
  }, []);

  // Fetch enrollment data
  useEffect(() => {
    if (!currentUser) {
      setEnrolledCourses([]);
      return;
    }

    const fetchEnrollments = async () => {
      try {
        const response = await fetch(`/api/progress/courses/?user_uid=${encodeURIComponent(currentUser.uid)}`);
        if (response.ok) {
          const data = await response.json();
          setEnrolledCourses(data.enrolled_courses || []);
        }
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      }
    };

    fetchEnrollments();
  }, [currentUser]);

  // Fetch completed topics for a selected course
  useEffect(() => {
    if (!currentUser || !selectedCourse) {
      setCompletedTopics([]);
      return;
    }

    const fetchCompletedTopics = async () => {
      try {
        const response = await fetch(`/api/progress/topics/?user_uid=${encodeURIComponent(currentUser.uid)}&course_id=${encodeURIComponent(selectedCourse)}`);
        if (response.ok) {
          const data = await response.json();
          setCompletedTopics(data.completed_topics || []);
        }
      } catch (err) {
        console.error("Failed to fetch completed topics", err);
      }
    };

    fetchCompletedTopics();
  }, [currentUser, selectedCourse]);

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      alert("Please log in to enroll in courses.");
      return;
    }

    if (enrolledCourses.length >= 3 && !enrolledCourses.includes(courseId)) {
      alert("You are already enrolled in 3 courses. Please un-enroll from one to add another.");
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await fetch('/api/progress/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_uid: currentUser.uid,
          course_id: courseId
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (!enrolledCourses.includes(courseId)) {
          setEnrolledCourses([...enrolledCourses, courseId]);
        }
      } else {
        alert(data.error || "Failed to enroll in course.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during enrollment.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!currentUser) return;

    if (window.confirm("Are you sure you want to un-enroll? You'll lose course tracking progress.")) {
      setIsEnrolling(true);
      try {
        const response = await fetch(`/api/progress/courses/?user_uid=${encodeURIComponent(currentUser.uid)}&course_id=${encodeURIComponent(courseId)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setEnrolledCourses(enrolledCourses.filter(c => c !== courseId));
        } else {
          alert("Failed to un-enroll.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsEnrolling(false);
      }
    }
  };

  const handleToggleTopicComplete = async (courseId: string, topicId: string, currentlyCompleted: boolean) => {
    if (!currentUser) return;

    const nextState = !currentlyCompleted;

    // Optimistic UI
    if (nextState) {
      setCompletedTopics([...completedTopics, topicId]);
    } else {
      setCompletedTopics(completedTopics.filter(id => id !== topicId));
    }

    try {
      const response = await fetch('/api/progress/topics/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_uid: currentUser.uid,
          course_id: courseId,
          topic_id: topicId,
          completed: nextState
        })
      });

      if (!response.ok) {
        // Revert
        if (!nextState) {
          setCompletedTopics([...completedTopics, topicId]);
        } else {
          setCompletedTopics(completedTopics.filter(id => id !== topicId));
        }
      }
    } catch (err) {
      console.error("Topic progress toggle failed:", err);
    }
  };

  // YouTube Progress Tracking 
  useEffect(() => {
    let player: any;
    let pollInterval: any;

    if (selectedVideo?.type === 'youtube' && selectedVideo.videoId && currentUser && enrolledCourses.includes(selectedCourse) && !completedTopics.includes(selectedVideo.id)) {
      const initYT = () => {
        player = new (window as any).YT.Player('yt-player', {
          events: {
            'onStateChange': (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                pollInterval = setInterval(() => {
                  try {
                    const currentTime = player.getCurrentTime();
                    const duration = player.getDuration();
                    if (duration > 0 && currentTime / duration >= 0.75) {
                      handleToggleTopicComplete(selectedCourse, selectedVideo.topicId, false);
                      clearInterval(pollInterval);
                    }
                  } catch (e) {
                    // ignore player access issues
                  }
                }, 1000);
              } else {
                clearInterval(pollInterval);
              }
            }
          }
        });
      };

      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
        (window as any).onYouTubeIframeAPIReady = initYT;
      } else {
        setTimeout(initYT, 500); // Give iframe a moment to render
      }
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (player && typeof player.destroy === 'function') {
        try { player.destroy(); } catch (e) { }
      }
    };
  }, [selectedVideo, currentUser, enrolledCourses, completedTopics, selectedCourse]);

  const currentCourse = courseData.find(c => c.id === selectedCourse);
  const currentTopic = currentCourse?.topics.find(t => t.id === selectedTopic);

  // Generate all videos for a topic (both YouTube and local)
  const getVideosForTopic = (courseId: string, topicId: string): VideoItem[] => {
    const videos: VideoItem[] = [];
    const course = courseData.find(c => c.id === courseId);
    const topic = course?.topics.find(t => t.id === topicId);

    if (topic) {
      // Add YouTube videos for this topic. We use a highly reliable YouTube Developers video to avoid 'Video Unavailable' errors for mock data.
      const youtubeVideos = [
        { id: `${topicId}-v1`, title: `${topic.title} - Main Lesson`, videoId: 'M7lc1UVf-VE' }
      ];

      youtubeVideos.forEach(yv => {
        videos.push({
          id: yv.id,
          type: 'youtube',
          title: yv.title,
          courseId: courseId,
          topicId: topicId,
          videoId: yv.videoId,
          thumbnail: `https://img.youtube.com/vi/${yv.videoId}/mqdefault.jpg`
        });
      });
    }

    // Add local videos for this topic
    const localVideos = allLocalVideos.filter(v => v.topicId === topicId);
    localVideos.forEach(lv => {
      videos.push({
        id: lv.id,
        type: 'local',
        title: lv.fileName,
        courseId: courseId,
        topicId: topicId,
        videoUrl: lv.videoUrl,
        fileName: lv.fileName
      });
    });

    return videos;
  };

  // Get all videos for selected course
  const getAllVideosForCourse = (courseId: string): VideoItem[] => {
    const videos: VideoItem[] = [];
    const course = courseData.find(c => c.id === courseId);

    if (course) {
      course.topics.forEach(topic => {
        // Add YouTube main video for each topic
        videos.push({
          id: `${courseId}-${topic.id}-main`,
          type: 'youtube',
          title: topic.title,
          courseId: courseId,
          topicId: topic.id,
          videoId: topic.videoId,
          thumbnail: `https://img.youtube.com/vi/${topic.videoId}/mqdefault.jpg`
        });

        // Add local videos for this topic
        const localVideos = allLocalVideos.filter(v => v.topicId === topic.id);
        localVideos.forEach(lv => {
          videos.push({
            id: lv.id,
            type: 'local',
            title: lv.fileName,
            courseId: courseId,
            topicId: topic.id,
            videoUrl: lv.videoUrl,
            fileName: lv.fileName
          });
        });
      });
    }

    return videos;
  };

  const displayedVideos = selectedTopic
    ? getVideosForTopic(selectedCourse, selectedTopic)
    : selectedCourse
      ? getAllVideosForCourse(selectedCourse)
      : [];

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;

    if (courseId && currentUser && !enrolledCourses.includes(courseId)) {
      if (enrolledCourses.length >= 3) {
        alert('You have reached the maximum of 3 enrolled courses. Please un-enroll from a course before enrolling in a new one. You can still view this course.');
      } else {
        const courseTitle = courseData.find(c => c.id === courseId)?.title || courseId;
        if (window.confirm(`Do you want to enroll in ${courseTitle}?`)) {
          handleEnroll(courseId);
          return; // handleEnroll will set selection state
        }
      }
    }

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
    setSelectedVideo(null);

    // Save progress
    const savedProgress = JSON.parse(localStorage.getItem('tutorai_course_progress') || '{}');
    localStorage.setItem('tutorai_course_progress', JSON.stringify({
      ...savedProgress,
      lastCourse: selectedCourse,
      lastTopic: topicId
    }));
  };

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);

    // Scroll to video player on mobile
    if (window.innerWidth < 768) {
      const videoElement = document.getElementById('video-player-container');
      videoElement?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderVideoCard = (video: VideoItem, isSelected: boolean) => {
    const isYoutube = video.type === 'youtube';

    return (
      <div
        key={video.id}
        onClick={() => handleVideoSelect(video)}
        style={{
          background: isSelected ? 'var(--accent)' : 'var(--background-secondary)',
          padding: '0.75rem',
          borderRadius: '12px',
          cursor: 'pointer',
          border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'transform 0.2s, border 0.2s, background 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Thumbnail or Icon */}
        <div style={{
          width: '120px',
          height: '68px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          background: isYoutube ? '#000' : 'var(--background)'
        }}>
          {isYoutube && video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-play-circle" style={{
                fontSize: '1.5rem',
                color: isSelected ? 'var(--background)' : 'var(--accent)'
              }}></i>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            color: isSelected ? 'var(--background)' : 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: isSelected ? 'bold' : 'normal',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {video.title}
          </p>
          <span style={{
            fontSize: '0.75rem',
            color: isSelected ? 'var(--background)' : 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem'
          }}>
            <i className={isYoutube ? 'fab fa-youtube' : 'fas fa-folder'}></i>
            {isYoutube ? 'YouTube' : 'Local Video'}
          </span>
        </div>

        {/* COMPLETION INDICATOR ON CARD */}
        {completedTopics.includes(video.topicId) && enrolledCourses.includes(selectedCourse) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: '1.25rem' }}></i>
          </div>
        )}
      </div>
    );
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

      <div className="courses-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* My Enrolled Courses Dashboard */}
        {enrolledCourses.length > 0 && currentUser && (
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-graduation-cap" style={{ color: 'var(--primary-500)' }}></i> 
              My Enrolled Courses ({enrolledCourses.length}/3)
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {enrolledCourses.map(courseId => {
                const course = courseData.find(c => c.id === courseId);
                if (!course) return null;
                return (
                  <div key={courseId} style={{ background: 'var(--bg-primary)', border: '1px solid var(--primary-300)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px', flex: '1 1 250px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleCourseChange({ target: { value: courseId } } as any)}>
                         View Course
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleUnenroll(courseId)} title="Drop Course">
                         <i className="fas fa-trash"></i> Drop
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
                  {course.title} {enrolledCourses.includes(course.id) ? '✅' : ''}
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
              <option value="">All Topics</option>
              {currentCourse?.topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Content */}
        <div className="courses-content">
          {!selectedCourse ? (
            <div className="text-center w-full">
              <i className="fas fa-book-open" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem', marginTop: '2rem' }}></i>
              <p>Please select a course to view available videos.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-500)', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600, borderBottom: '3px solid var(--primary-500)', cursor: 'default', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fas fa-play-circle"></i> Course Content
                </button>
                <button 
                  onClick={() => navigate(`/community?course=${selectedCourse}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 600, borderBottom: '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fas fa-external-link-alt"></i> Open Community Q&A
                </button>
              </div>

              <div className="video-wrapper" id="course-video">
                <div className="video-header" style={{ position: 'relative' }}>
                  <h3>
                    <i className="fas fa-play-circle"></i>
                    {currentTopic ? currentTopic.title : currentCourse?.title}
                  </h3>
                  <p>{currentCourse?.title} - {displayedVideos.length} videos available</p>

                  {/* ENROLLMENT BADGE / ACTIONS */}
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                    {enrolledCourses.includes(selectedCourse) ? (
                      <>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          padding: '0.4rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          border: '1px solid #10b981'
                        }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
                          Enrolled
                        </span>
                        <button
                          onClick={() => handleUnenroll(selectedCourse)}
                          disabled={isEnrolling}
                          style={{
                            background: 'transparent',
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-color)',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            cursor: isEnrolling ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isEnrolling ? 0.7 : 1
                          }}
                        >
                          Un-enroll
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnroll(selectedCourse)}
                        disabled={isEnrolling || (!enrolledCourses.includes(selectedCourse) && enrolledCourses.length >= 3)}
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          padding: '0.5rem 1.5rem',
                          borderRadius: '20px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: isEnrolling || (!enrolledCourses.includes(selectedCourse) && enrolledCourses.length >= 3) ? 'not-allowed' : 'pointer',
                          opacity: isEnrolling || (!enrolledCourses.includes(selectedCourse) && enrolledCourses.length >= 3) ? 0.5 : 1,
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        {enrolledCourses.length >= 3 ? 'Enrollment Full (3/3)' : 'Enroll in Course'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Player */}
                {selectedVideo && (
                  <div id="video-player-container" style={{ marginBottom: '2rem' }}>
                    {selectedVideo.type === 'youtube' && selectedVideo.videoId ? (
                      <div className="iframe-container">
                        <iframe
                          id="yt-player"
                          src={`https://www.youtube.com/embed/${selectedVideo.videoId}?enablejsapi=1`}
                          title={selectedVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : selectedVideo.type === 'local' && selectedVideo.videoUrl ? (
                      <video
                        controls
                        autoPlay
                        src={selectedVideo.videoUrl}
                        onTimeUpdate={(e) => {
                          const video = e.currentTarget;
                          const progress = video.currentTime / video.duration;
                          if (progress >= 0.75 && selectedVideo && currentUser && enrolledCourses.includes(selectedCourse) && !completedTopics.includes(selectedVideo.topicId)) {
                            handleToggleTopicComplete(selectedCourse, selectedVideo.topicId, false);
                          }
                        }}
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          maxHeight: '70vh'
                        }}
                      >
                        Your browser does not support video playback.
                      </video>
                    ) : null}

                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--background-secondary)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <i className={selectedVideo.type === 'youtube' ? 'fab fa-youtube' : 'fas fa-folder'}
                          style={{ fontSize: '1.5rem', color: 'var(--accent)' }}></i>
                        <span style={{ fontWeight: 'bold' }}>{selectedVideo.title}</span>
                      </div>
                      
                      {!completedTopics.includes(selectedVideo.topicId) && enrolledCourses.includes(selectedCourse) && (
                        <button
                          onClick={() => handleToggleTopicComplete(selectedCourse, selectedVideo.topicId, false)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem'
                          }}
                        >
                          <i className="fas fa-check"></i> Mark as Completed
                        </button>
                      )}
                    </div>
                    {/* Add Interaction Component underneath the video player */}
                    <div style={{ marginTop: '1rem' }}>
                        <VideoInteraction videoId={selectedVideo.id} />
                    </div>
                  </div>
                )}

                {/* Playlist */}
                <div className="playlist-container">
                  <h4 style={{ 
                    marginBottom: '1rem', 
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Topic Videos</span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      background: 'var(--background-secondary)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px'
                    }}>
                      {displayedVideos.length}
                    </span>
                  </h4>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}>
                    {displayedVideos.map(video => renderVideoCard(video, selectedVideo?.id === video.id))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default Courses;
