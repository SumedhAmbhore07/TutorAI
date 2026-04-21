import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    location: '',
    course: '',
    photoURL: ''
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [timeStats, setTimeStats] = useState({ total_time_seconds: 0, today_time_seconds: 0 });
  const [quizStats, setQuizStats] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/stats/time/?user_uid=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) setTimeStats(data);
        })
        .catch(console.error);

      fetch(`/api/stats/quiz/?user_uid=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) setQuizStats(data.results || []);
        })
        .catch(console.error)
        .finally(() => setStatsLoading(false));
    }
  }, [currentUser]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || currentUser?.displayName || '',
        email: userData.email || currentUser?.email || '',
        phone: userData.phone || '',
        age: userData.age || '',
        location: userData.location || '',
        course: userData.course || '',
        photoURL: userData.photoURL || currentUser?.photoURL || ''
      });
    }
  }, [userData, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (userData) {
      setFormData({
        name: userData.name || currentUser?.displayName || '',
        email: userData.email || currentUser?.email || '',
        phone: userData.phone || '',
        age: userData.age || '',
        location: userData.location || '',
        course: userData.course || '',
        photoURL: userData.photoURL || currentUser?.photoURL || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateUserData({
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        location: formData.location,
        course: formData.course
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes');
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <h1>
            <i className="fas fa-user"></i>
            Your Profile
          </h1>
        </div>
        <div className="profile-container">
          <div className="login-prompt">
            <i className="fas fa-lock"></i>
            <h3>Authentication Required</h3>
            <p>Please log in to view and manage your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>
          <i className="fas fa-user"></i>
          Your Profile
        </h1>
      </div>
      
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-section">
              <img 
                className="profile-avatar"
                src={formData.photoURL || 'https://via.placeholder.com/150'} 
                alt="Profile"
              />
              {isEditing && (
                <button className="change-avatar-btn">
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
            <h2 className="profile-name">{formData.name || 'User'}</h2>
            <p className="profile-email">{formData.email}</p>
          </div>
          
          <div className="profile-form">
            <div className="profile-grid">
              <div className="profile-field">
                <label>
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="profile-field">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                />
              </div>
              
              <div className="profile-field">
                <label>
                  <i className="fas fa-phone"></i>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="profile-field">
                <label>
                  <i className="fas fa-birthday-cake"></i>
                  Age
                </label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  min="1"
                  max="120"
                />
              </div>
              
              <div className="profile-field">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  Location
                </label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="profile-field">
                <label>
                  <i className="fas fa-graduation-cap"></i>
                  Course
                </label>
                <select 
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Your Course</option>
                  <option value="dsa">Data Structures & Algorithms (DSA)</option>
                  <option value="web-dev">Web Development (HTML, CSS, JavaScript, React)</option>
                  <option value="python">Python Programming</option>
                  <option value="dbms">Database Management Systems (SQL + DBMS)</option>
                  <option value="oop">Object-Oriented Programming (Java / C++)</option>
                  <option value="ai-ml">Artificial Intelligence & Machine Learning</option>
                  <option value="data-science">Data Science & Analytics</option>

                  <option value="cybersecurity">Cybersecurity & Ethical Hacking</option>
                  <option value="os-networks">Operating Systems & Computer Networks</option>
                  <option value="mobile-dev">Mobile App Development (Flutter / React Native)</option>
                </select>
              </div>
              
              <div className="profile-field full-width">
                <label>
                  <i className="fas fa-calendar-alt"></i>
                  Member since
                </label>
                <div className="static-value">
                  {formatDate(userData?.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="profile-btn edit-btn"
                  onClick={handleEdit}
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    className="profile-btn save-btn"
                    onClick={handleSave}
                  >
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                  <button 
                    className="profile-btn cancel-btn"
                    onClick={handleCancel}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics & Analytics Section */}
        <div className="profile-card" style={{ marginTop: '2rem' }}>
          <div className="profile-card-header" style={{ alignItems: 'flex-start' }}>
            <h2 className="profile-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-chart-line" style={{ color: 'var(--primary-color)' }}></i> 
              Statistics & Analytics
            </h2>
          </div>
          
          <div className="profile-form">
            {statsLoading ? (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                 <i className="fas fa-spinner fa-spin"></i> Loading statistics...
               </div>
            ) : (
               <>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                     <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Time Spent Today</p>
                     <h3 style={{ margin: '0.5rem 0 0', color: 'var(--text-primary)', fontSize: '1.8rem' }}>{formatTime(timeStats.today_time_seconds)}</h3>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                     <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Time Spent</p>
                     <h3 style={{ margin: '0.5rem 0 0', color: 'var(--text-primary)', fontSize: '1.8rem' }}>{formatTime(timeStats.total_time_seconds)}</h3>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid #8B5CF6' }}>
                     <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Quizzes Taken</p>
                     <h3 style={{ margin: '0.5rem 0 0', color: 'var(--text-primary)', fontSize: '1.8rem' }}>{quizStats.length}</h3>
                   </div>
                 </div>

                 {quizStats.length > 0 && (
                   <div style={{ marginBottom: '3rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
                     <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Performance Trend (Recent Quizzes)</h3>
                     <div style={{ height: 300, width: '100%' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart
                           data={[...quizStats].reverse().map((r, i) => ({
                             name: `Q${i + 1}`,
                             score: Math.round((r.score / r.total_questions) * 100),
                             course: r.course_id
                           }))}
                           margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                         >
                           <defs>
                             <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                           <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                           <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                           <Tooltip 
                             contentStyle={{ background: 'var(--bg-default)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                             itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey="score" stroke="#10B981" fillOpacity={1} fill="url(#colorScore)" name="Score (%)" />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 )}

                 <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                   Recent Quiz Results
                 </h3>
                 {quizStats.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                     You haven't taken any quizzes yet.
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {quizStats.slice(0, 5).map(result => (
                       <div key={result.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                         <div>
                           <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Course: {result.course_id}</h4>
                           <small style={{ color: 'var(--text-secondary)' }}>{formatDate(result.taken_at)}</small>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: (result.score / result.total_questions) >= 0.7 ? '#10B981' : '#F59E0B' }}>
                             {Math.round((result.score / result.total_questions) * 100)}%
                           </span>
                           <span style={{ color: 'var(--text-secondary)' }}>
                             ({result.score}/{result.total_questions})
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
