import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './VideoInteraction.css'; // Create styles for this later

interface Comment {
    id: number;
    user_name: string;
    user_uid: string;
    text: string;
    created_at: string;
}

interface InteractionStatus {
    likes_count: number;
    user_liked: boolean;
    comments: Comment[];
}

interface VideoInteractionProps {
    videoId: string;
}

const VideoInteraction: React.FC<VideoInteractionProps> = ({ videoId }) => {
    const { currentUser, userData } = useAuth();

    const [status, setStatus] = useState<InteractionStatus>({
        likes_count: 0,
        user_liked: false,
        comments: []
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [commentText, setCommentText] = useState<string>('');
    const [submittingComment, setSubmittingComment] = useState<boolean>(false);

    useEffect(() => {
        fetchInteractionStatus();
    }, [videoId, currentUser]);

    const fetchInteractionStatus = async () => {
        try {
            setLoading(true);
            let url = `/api/videos/${encodeURIComponent(videoId)}/interactions/`;
            if (currentUser?.uid) {
                url += `?user_uid=${encodeURIComponent(currentUser.uid)}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            } else {
                console.error("Failed to fetch interaction status");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async () => {
        if (!currentUser) {
            alert("Please log in to like this video.");
            return;
        }

        // Optimistic UI update
        const newlyLiked = !status.user_liked;
        setStatus(prev => ({
            ...prev,
            user_liked: newlyLiked,
            likes_count: newlyLiked ? prev.likes_count + 1 : prev.likes_count - 1
        }));

        try {
            const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}/like/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_uid: currentUser.uid
                })
            });

            if (!response.ok) {
                // Revert on failure
                setStatus(prev => ({
                    ...prev,
                    user_liked: !newlyLiked,
                    likes_count: !newlyLiked ? prev.likes_count + 1 : prev.likes_count - 1
                }));
                console.error("Failed to toggle like");
            }
        } catch (err) {
            console.error(err);
            // Revert on failure
            setStatus(prev => ({
                ...prev,
                user_liked: !newlyLiked,
                likes_count: !newlyLiked ? prev.likes_count + 1 : prev.likes_count - 1
            }));
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Please log in to post a comment.");
            return;
        }
        if (!commentText.trim()) return;

        setSubmittingComment(true);

        try {
            const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}/comment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_uid: currentUser.uid,
                    user_name: userData?.displayName || currentUser.displayName || 'Anonymous User',
                    text: commentText.trim()
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                setStatus(prev => ({
                    ...prev,
                    comments: [newComment, ...prev.comments] // Prepend new comment
                }));
                setCommentText('');
            } else {
                console.error("Failed to post comment");
                alert("Failed to post comment. Please try again.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return <div className="video-interaction-skeleton"><i className="fas fa-spinner fa-spin"></i> Loading context...</div>;
    }

    return (
        <div className="video-interaction-container">
            {/* Interaction Bar */}
            <div className="interaction-bar">
                <button
                    className={`like-button ${status.user_liked ? 'liked' : ''}`}
                    onClick={handleToggleLike}
                    title={currentUser ? "Like video" : "Please log in to like"}
                >
                    <i className={`${status.user_liked ? 'fas' : 'far'} fa-thumbs-up`}></i>
                    <span>{status.likes_count} {status.likes_count === 1 ? 'Like' : 'Likes'}</span>
                </button>
            </div>

            <div className="comments-section">
                <h4 className="comments-header">
                    {status.comments.length} {status.comments.length === 1 ? 'Comment' : 'Comments'}
                </h4>

                {/* Comment Input */}
                <div className="comment-input-area">
                    {!currentUser ? (
                        <div className="login-prompt-comment">
                            <p>Please log in to join the discussion.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePostComment} className="comment-form">
                            <div className="avatar-placeholder">
                                {(userData?.displayName || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={submittingComment}
                                />
                                {commentText.trim() && (
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setCommentText('')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-submit"
                                            disabled={submittingComment}
                                        >
                                            {submittingComment ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Comments List */}
                <div className="comments-list">
                    {status.comments.length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first to start the discussion!</p>
                    ) : (
                        status.comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-avatar">
                                    {comment.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.user_name}</span>
                                        <span className="comment-date">
                                            {new Date(comment.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoInteraction;
