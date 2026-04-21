from django.urls import path
from .views import (
    UploadPDFView, AskAIView, VideoListView,
    VideoInteractionStatusView, VideoLikeToggleView, VideoCommentCreateView,
    UserCoursesView, TopicProgressView, CourseQuizView,
    QuizResultView, UserTimeTrackingView,
    CommunityPostView, CommunityCommentView
)

urlpatterns = [
    path('upload-pdf/', UploadPDFView.as_view(), name='upload_pdf'),
    path('ask/', AskAIView.as_view(), name='ask_ai'),
    path('videos/', VideoListView.as_view(), name='video_list'),
    path('videos/<str:video_id>/interactions/', VideoInteractionStatusView.as_view(), name='video_interactions'),
    path('videos/<str:video_id>/like/', VideoLikeToggleView.as_view(), name='video_like'),
    path('videos/<str:video_id>/comment/', VideoCommentCreateView.as_view(), name='video_comment'),
    
    # Progress endpoints
    path('progress/courses/', UserCoursesView.as_view(), name='user_courses'),
    path('progress/topics/', TopicProgressView.as_view(), name='topic_progress'),
    
    # Quiz endpoints
    path('courses/<str:course_id>/quiz/', CourseQuizView.as_view(), name='course_quiz'),
    
    # Statistics endpoints
    path('stats/quiz/', QuizResultView.as_view(), name='stats_quiz'),
    path('stats/time/', UserTimeTrackingView.as_view(), name='stats_time'),

    # Community endpoints
    path('community/posts/', CommunityPostView.as_view(), name='community_posts'),
    path('community/comments/', CommunityCommentView.as_view(), name='community_comments'),
]
