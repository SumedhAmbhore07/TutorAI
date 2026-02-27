import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
      </div>
    </div>
  );
};

export default Profile;
