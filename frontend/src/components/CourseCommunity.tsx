import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface VideoItem {
  id: string;
  type: 'youtube' | 'local';
  title: string;
  courseId: string;
  topicId: string;
  videoId?: string;
  videoUrl?: string;
  fileName?: string;
}

interface CourseCommunityProps {
  courseId: string;
  availableVideos: VideoItem[];
  onPinVideoClick: (videoId: string, type: 'youtube' | 'local') => void;
}

interface Comment {
  id: number;
  user_uid: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  user_uid: string;
  user_name: string;
  title: string;
  content: string;
  pinned_video_id: string | null;
  pinned_video_title: string | null;
  created_at: string;
  comment_count: number;
  comments?: Comment[];
}

const CourseCommunity: React.FC<CourseCommunityProps> = ({ courseId, availableVideos, onPinVideoClick }) => {
  const { currentUser, userData } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<Post | null>(null);
  
  // Create Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');

  // Comment State
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [courseId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts/?course_id=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/community/comments/?post_id=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setActivePost(prev => prev && prev.id === postId ? { ...prev, comments: data.comments } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;
    
    let pinnedTitle = null;
    if (selectedVideoId) {
       const v = availableVideos.find(vid => vid.id === selectedVideoId);
       if (v) pinnedTitle = v.title;
    }

    try {
      const res = await fetch('/api/community/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          user_uid: currentUser.uid,
          user_name: userData.name || 'Student',
          title: newTitle,
          content: newContent,
          pinned_video_id: selectedVideoId || null,
          pinned_video_title: pinnedTitle
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setSelectedVideoId('');
        setIsCreating(false);
        fetchPosts(); // refreshing list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData || !activePost) return;

    try {
      const res = await fetch('/api/community/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: activePost.id,
          user_uid: currentUser.uid,
          user_name: userData.name || 'Student',
          content: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments(activePost.id); // refreshing comments
        fetchPosts(); // updating the main post count
      }
    } catch (err) {
      console.error(err);
    }
  };

  const viewPost = (post: Post) => {
    setActivePost(post);
    fetchComments(post.id);
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) return;
    if (window.confirm('Are you satisfied with the answers and ready to delete this question?')) {
      try {
        const res = await fetch(`/api/community/posts/?post_id=${postId}&user_uid=${currentUser.uid}`, {
          method: 'DELETE'
        });
        if (res.ok) {
           if (activePost?.id === postId) setActivePost(null);
           fetchPosts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
        <p>Loading community posts...</p>
      </div>
    );
  }

  // Details View
  if (activePost) {
    return (
      <div className="community-post-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => setActivePost(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Discussions
          </button>
          
          {currentUser && activePost.user_uid === currentUser.uid && (
             <button 
               onClick={() => handleDeletePost(activePost.id)}
               className="btn btn-sm"
               style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
             >
               <i className="fas fa-trash"></i> Delete Question
             </button>
          )}
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{activePost.title}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <span><i className="fas fa-user-circle"></i> {activePost.user_name}</span>
            <span><i className="far fa-clock"></i> {formatDate(activePost.created_at)}</span>
            
            {activePost.pinned_video_id && (
              <span 
                className="pinned-video-badge"
                style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: '1px solid var(--primary-500)' }}
                onClick={() => {
                  const v = availableVideos.find(vid => vid.id === activePost.pinned_video_id);
                  if (v) {
                     onPinVideoClick(v.id, v.type);
                  }
                }}
              >
                <i className="fas fa-paperclip"></i>
                Pinned: {activePost.pinned_video_title}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {activePost.content}
          </p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Comments ({activePost.comment_count})
          </h3>

          {commentsLoading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>
          ) : activePost.comments && activePost.comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {activePost.comments.map(c => (
                <div key={c.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', borderLeft: '3px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.user_name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(c.created_at)}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '2rem' }}>
              No answers yet. Be the first to help out!
            </div>
          )}

          {/* New Comment Box */}
          {currentUser ? (
            <form onSubmit={handleCreateComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea 
                placeholder="Give your answer or ask for more clarification..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }}
              />
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1.5rem' }}>
                Post Reply
              </button>
            </form>
          ) : (
             <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderRadius: '8px' }}>
               Please log in to participate in the discussion.
             </div>
          )}
        </div>
      </div>
    );
  }

  // Feed View
  return (
    <div className="community-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>Discussions</h2>
        {currentUser && !isCreating && (
          <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-plus"></i> Ask a Doubt
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--primary-500)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>New Doubt</h3>
          
          <input 
            type="text" 
            placeholder="Question Title (e.g., Confused about Python Lists)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />

          <select 
            value={selectedVideoId}
            onChange={e => setSelectedVideoId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <option value="">-- No specific video pinned --</option>
            {availableVideos.length > 0 && availableVideos.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>

          <textarea 
            placeholder="Describe your doubt in detail..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: '120px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Post Doubt</button>
          </div>
        </form>
      )}

      {posts.length === 0 && !isCreating ? (
        <div className="empty-state" style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <i className="fas fa-comments" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '1rem' }}></i>
          <h3 style={{ color: 'var(--text-secondary)' }}>No doubts asked yet!</h3>
          <p style={{ color: 'var(--text-tertiary)' }}>Be the first one to spark a discussion in this course.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <div 
              key={post.id} 
              onClick={() => viewPost(post)}
              style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', transition: 'border 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: 1.4 }}>{post.title}</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', flexShrink: 0 }}>
                  <i className="far fa-comment-alt"></i> {post.comment_count}
                </span>
              </div>
              
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                   Asked by <strong style={{ color: 'var(--text-secondary)' }}>{post.user_name}</strong> • {formatDate(post.created_at)}
                </span>
                {post.pinned_video_id && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-500)', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fas fa-paperclip"></i> {post.pinned_video_title}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCommunity;
