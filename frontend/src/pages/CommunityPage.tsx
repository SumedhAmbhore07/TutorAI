import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCommunity from '../components/CourseCommunity';
import { useAuth } from '../contexts/AuthContext';

// Minimal course data for the sidebar
const courseChannels = [
  { id: 'dsa', title: 'Data Structures & Algorithms', icon: 'fa-project-diagram' },
  { id: 'web-dev', title: 'Web Development', icon: 'fa-laptop-code' },
  { id: 'python', title: 'Python Programming', icon: 'fab fa-python' },
  { id: 'dbms', title: 'Database Management', icon: 'fa-database' },
  { id: 'oop', title: 'OOP Concepts', icon: 'fa-cubes' },
  { id: 'ai-ml', title: 'AI & Machine Learning', icon: 'fa-brain' },
  { id: 'data-science', title: 'Data Science', icon: 'fa-chart-pie' },
  { id: 'cybersecurity', title: 'Cybersecurity', icon: 'fa-shield-alt' },
  { id: 'os-networks', title: 'OS & Networks', icon: 'fa-network-wired' },
  { id: 'mobile-dev', title: 'Mobile Dev', icon: 'fa-mobile-alt' }
];

const CommunityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourse = searchParams.get('course') || 'web-dev';
  const [activeChannel, setActiveChannel] = useState(initialCourse);
  const { currentUser } = useAuth();
  
  const [availableVideos, setAvailableVideos] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

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

  useEffect(() => {
    // If we wanted to fetch actual videos for pinning from the community page, we would do it here.
    // For now, we'll fetch local videos just to populate the pinning dropdown partially.
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos/');
        if (response.ok) {
          const data = await response.json();
          // Filter videos by the active channel to help pinning
          const channelVideos = data.videos
            .filter((v: any) => v.courseId === activeChannel)
            .map((v: any) => ({
              id: v.id,
              type: 'local',
              title: v.fileName,
              courseId: v.courseId,
              topicId: v.topicId
            }));
          setAvailableVideos(channelVideos);
        }
      } catch (error) {
        console.error("Failed to fetch videos", error);
      }
    };
    fetchVideos();
  }, [activeChannel]);

  const handleChannelSelect = (id: string) => {
    setActiveChannel(id);
    setSearchParams({ course: id });
  };

  return (
    <div className="community-page" style={{ display: 'flex', height: '100vh', paddingTop: '72px', background: 'var(--bg-primary)' }}>
      {/* Sidebar Channels */}
      <div className="community-sidebar" style={{ width: '280px', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '1rem', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-users-cog"></i> Communities
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {courseChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSelect(channel.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeChannel === channel.id ? 'var(--primary-500)' : 'transparent',
                color: activeChannel === channel.id ? '#fff' : 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontWeight: activeChannel === channel.id ? 600 : 400
              }}
              onMouseEnter={(e) => {
                if (activeChannel !== channel.id) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                if (activeChannel !== channel.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <i className={`fas ${channel.icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.title}</span>
                {enrolledCourses.includes(channel.id) && (
                  <i className="fas fa-check-circle" style={{ color: activeChannel === channel.id ? '#fff' : '#10b981', fontSize: '0.9rem' }} title="Enrolled"></i>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat / Forum Area */}
      <div className="community-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {!currentUser && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <i className="fas fa-exclamation-circle"></i> Please log in to view or participate in community discussions!
          </div>
        )}
        
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
             <h1 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <i className={`fas ${courseChannels.find(c => c.id === activeChannel)?.icon}`}></i>
               {courseChannels.find(c => c.id === activeChannel)?.title} Discussion Board
             </h1>
             <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Ask questions, share resources, and help your peers.</p>
          </div>
          
          <CourseCommunity 
            courseId={activeChannel} 
            availableVideos={availableVideos} 
            onPinVideoClick={() => {
               // When clicked from Community Page, we could link back to the course.
               window.location.href = `/courses?course=${activeChannel}`;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
