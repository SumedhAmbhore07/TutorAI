import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from PyPDF2 import PdfReader

class UploadPDFView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('pdf')
        if not file_obj:
            return Response({'error': 'No PDF file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read PDF directly from memory
            reader = PdfReader(file_obj)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"

            # Generate summary using Groq AI
            summary = self.generate_summary(text)

            return Response({
                'text': text,
                'summary': summary,
                'pages': len(reader.pages),
                'filename': file_obj.name
            })
        except Exception as e:
            # Check if it's a PDF parsing error (often generic Exception or PyPDF2 errors)
            # For simplicity, if we fail to read it, assume it's a bad file (400)
            # unless it's a system error.
            if "EOF marker not found" in str(e) or "IsNotPDF" in str(e): # Common PyPDF2 errors
                 return Response({'error': 'Invalid PDF file.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'error': f'Error processing PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_summary(self, text):
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            return "Server configuration error: API Key missing."

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that summarizes documents. Provide a concise summary of the given text, highlighting key points and main ideas."},
                        {"role": "user", "content": f"Please summarize the following document:\n\n{text[:4000]}"}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.3
                },
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30
            )

            if response.status_code == 200:
                summary = response.json().get('choices', [{}])[0].get('message', {}).get('content', "Unable to generate summary.")
                return summary
            else:
                return f"Error generating summary: {response.text}"

        except Exception as e:
            return f"Error connecting to AI service for summary: {str(e)}"

class AskAIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        question = request.data.get('question')
        pdf_context = request.data.get('pdfContext')

        if not question:
            return Response({'answer': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)

        system_message = "You are a general AI assistant. Answer any question on any topic openly and helpfully. Do not restrict to educational subjects. Provide clear, engaging explanations with examples when helpful. Keep responses conversational and encouraging."

        if pdf_context:
            system_message += f"\n\nYou have access to the following PDF content. Use this information to answer questions about the PDF when relevant:\n\n{pdf_context}"

        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            return Response({'answer': 'Server configuration error: API Key missing.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": question}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                answer = response.json().get('choices', [{}])[0].get('message', {}).get('content', "Sorry, I couldn't generate a response.")
                return Response({'answer': answer})
            else:
                 return Response({'answer': f'Error from AI provider: {response.text}'}, status=status.HTTP_502_BAD_GATEWAY)

        except requests.exceptions.Timeout:
            return Response({'answer': 'Request timed out. The AI service is taking too long to respond.'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.ConnectionError:
            return Response({'answer': 'Unable to connect to AI service. Please check your internet connection.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'answer': f'Error connecting to AI service: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import urllib.parse

class VideoListView(APIView):
    permission_classes = [AllowAny]
    
    COURSE_DATA = [
      {
        "id": "dsa",
        "title": "Data Structures & Algorithms",
        "topics": [
          { "id": "dsa-intro", "title": "Introduction to DSA" },
          { "id": "dsa-arrays", "title": "Arrays & Strings" },
          { "id": "dsa-ll", "title": "Linked Lists" },
          { "id": "dsa-stacks", "title": "Stacks & Queues" },
          { "id": "dsa-trees", "title": "Binary Trees" },
          { "id": "dsa-graphs", "title": "Graph Algorithms" },
          { "id": "dsa-sorting", "title": "Sorting & Searching" }
        ]
      },
      {
        "id": "web-dev",
        "title": "Web Development",
        "topics": [
          { "id": "web-html", "title": "HTML5 & Semantic Web" },
          { "id": "web-css", "title": "CSS3 & Flexbox Grid" },
          { "id": "web-js", "title": "JavaScript Fundamentals" },
          { "id": "web-react", "title": "React.js Basics" },
          { "id": "web-node", "title": "Node.js & Express" },
          { "id": "web-responsive", "title": "Responsive Design" }
        ]
      },
      {
        "id": "python",
        "title": "Python Programming",
        "topics": [
          { "id": "py-intro", "title": "Python Introduction" },
          { "id": "py-data", "title": "Data Types & Variables" },
          { "id": "py-funcs", "title": "Functions & Modules" },
          { "id": "py-oop", "title": "OOP in Python" },
          { "id": "py-pandas", "title": "Data Analysis with Pandas" }
        ]
      },
      {
        "id": "dbms",
        "title": "Database Management Systems",
        "topics": [
          { "id": "db-intro", "title": "Introduction to DBMS" },
          { "id": "db-relational", "title": "Relational Model & Keys" },
          { "id": "db-sql", "title": "SQL Queries" },
          { "id": "db-normalized", "title": "Normalization" },
          { "id": "db-nosql", "title": "Introduction to NoSQL" }
        ]
      },
      {
        "id": "oop",
        "title": "Object-Oriented Programming",
        "topics": [
          { "id": "oop-concepts", "title": "Core OOP Concepts" },
          { "id": "oop-java", "title": "OOP with Java" },
          { "id": "oop-cpp", "title": "OOP with C++" },
          { "id": "oop-design", "title": "Design Patterns" }
        ]
      },
      {
        "id": "ai-ml",
        "title": "AI & Machine Learning",
        "topics": [
          { "id": "ai-intro", "title": "Artificial Intelligence Basics" },
          { "id": "ml-types", "title": "Supervised vs Unsupervised" },
          { "id": "ml-python", "title": "ML with Scikit-Learn" },
          { "id": "dl-intro", "title": "Neural Networks & Deep Learning" }
        ]
      },
      {
        "id": "data-science",
        "title": "Data Science & Analytics",
        "topics": [
          { "id": "ds-intro", "title": "Introduction to Data Science" },
          { "id": "ds-stats", "title": "Statistics for Data Science" },
          { "id": "ds-viz", "title": "Data Visualization" },
          { "id": "ds-sql", "title": "SQL for Data Science" }
        ]
      },
      {
        "id": "cybersecurity",
        "title": "Cybersecurity & Ethical Hacking",
        "topics": [
          { "id": "cyber-intro", "title": "Cyber Security for Beginners" },
          { "id": "cyber-net", "title": "Network Security" },
          { "id": "cyber-hacking", "title": "Ethical Hacking 101" },
          { "id": "cyber-def", "title": "Defensive Security" }
        ]
      },
      {
        "id": "os-networks",
        "title": "Operating Systems & Networks",
        "topics": [
          { "id": "os-intro", "title": "Operating Systems Overview" },
          { "id": "net-intro", "title": "Computer Networks Basics" },
          { "id": "os-process", "title": "Process Management" },
          { "id": "net-osi", "title": "The OSI Model" }
        ]
      },
      {
        "id": "mobile-dev",
        "title": "Mobile App Development",
        "topics": [
          { "id": "mob-intro", "title": "Intro to Mobile Development" },
          { "id": "mob-flutter", "title": "Flutter Basics" },
          { "id": "mob-react", "title": "React Native Crash Course" },
          { "id": "mob-native", "title": "Android vs iOS Native" }
        ]
      }
    ]

    def get_safe_folder_name(self, name):
        return name.replace("/", "-").replace("\\", "-").replace(":", "-").replace("*", "-").replace("?", "-").replace("\"", "-").replace("<", "-").replace(">", "-").replace("|", "-")

    def get(self, request, *args, **kwargs):
        course_id_filter = request.query_params.get('course_id')
        topic_id_filter = request.query_params.get('topic_id')

        base_dir = os.path.join(settings.MEDIA_ROOT, 'courses')
        videos = []
        
        if not os.path.exists(base_dir):
            return Response({'videos': videos})
            
        for course in self.COURSE_DATA:
            c_id = course['id']
            if course_id_filter and c_id != course_id_filter:
                continue
                
            c_title = self.get_safe_folder_name(course['title'])
            course_path = os.path.join(base_dir, c_title)
            
            if not os.path.isdir(course_path):
                continue
                
            for topic in course['topics']:
                t_id = topic['id']
                if topic_id_filter and t_id != topic_id_filter:
                    continue
                    
                t_title = self.get_safe_folder_name(topic['title'])
                topic_path = os.path.join(course_path, t_title)
                
                if not os.path.isdir(topic_path):
                    continue
                    
                for file_name in os.listdir(topic_path):
                    if file_name.lower().endswith(('.mp4', '.webm', '.ogg', '.mkv')):
                        # encode parts for url
                        encoded_c_title = urllib.parse.quote(c_title)
                        encoded_t_title = urllib.parse.quote(t_title)
                        encoded_file_name = urllib.parse.quote(file_name)
                        
                        video_url = f"{settings.MEDIA_URL}courses/{encoded_c_title}/{encoded_t_title}/{encoded_file_name}"
                        videos.append({
                            'id': f"{c_id}-{t_id}-{file_name}",
                            'courseId': c_id,
                            'topicId': t_id,
                            'fileName': file_name,
                            'videoUrl': video_url
                        })
                        
        return Response({'videos': videos})

from .models import VideoLike, VideoComment

class VideoInteractionStatusView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, video_id, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        
        # Likes count
        likes_count = VideoLike.objects.filter(video_id=video_id).count()
        
        # Check if user liked
        user_liked = False
        if user_uid:
            user_liked = VideoLike.objects.filter(video_id=video_id, user_uid=user_uid).exists()
            
        # Get comments
        comments_qs = VideoComment.objects.filter(video_id=video_id)
        comments = [
            {
                'id': c.id,
                'user_name': c.user_name,
                'user_uid': c.user_uid,
                'text': c.text,
                'created_at': c.created_at.isoformat()
            } for c in comments_qs
        ]
        
        return Response({
            'likes_count': likes_count,
            'user_liked': user_liked,
            'comments': comments
        })

class VideoLikeToggleView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, video_id, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        if not user_uid:
            return Response({'error': 'user_uid is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Toggle like
        like, created = VideoLike.objects.get_or_create(video_id=video_id, user_uid=user_uid)
        
        if not created:
            # User already liked, so unlike it
            like.delete()
            return Response({'liked': False})
            
        return Response({'liked': True})

class VideoCommentCreateView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, video_id, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        user_name = request.data.get('user_name')
        text = request.data.get('text')
        
        if not all([user_uid, user_name, text]):
             return Response({'error': 'user_uid, user_name, and text are required'}, status=status.HTTP_400_BAD_REQUEST)
             
        comment = VideoComment.objects.create(
            video_id=video_id,
            user_uid=user_uid,
            user_name=user_name,
            text=text
        )
        
        return Response({
            'id': comment.id,
            'user_name': comment.user_name,
            'user_uid': comment.user_uid,
            'text': comment.text,
            'created_at': comment.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)

from .models import UserCourseProgress, TopicProgress

class UserCoursesView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        if not user_uid:
            return Response({'error': 'user_uid is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        courses = UserCourseProgress.objects.filter(user_uid=user_uid)
        return Response({
            'enrolled_courses': [c.course_id for c in courses]
        })
        
    def post(self, request, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        course_id = request.data.get('course_id')
        
        if not user_uid or not course_id:
            return Response({'error': 'user_uid and course_id are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check limit
        current_count = UserCourseProgress.objects.filter(user_uid=user_uid).count()
        
        # Check if already enrolled to avoid counting it against limit incorrectly
        if UserCourseProgress.objects.filter(user_uid=user_uid, course_id=course_id).exists():
            return Response({'message': 'Already enrolled', 'course_id': course_id})
            
        if current_count >= 3:
            return Response({'error': 'Maximum of 3 courses allowed'}, status=status.HTTP_403_FORBIDDEN)
            
        UserCourseProgress.objects.create(user_uid=user_uid, course_id=course_id)
        return Response({'message': 'Successfully enrolled', 'course_id': course_id}, status=status.HTTP_201_CREATED)
        
    def delete(self, request, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        course_id = request.query_params.get('course_id')
        
        if not user_uid or not course_id:
            return Response({'error': 'user_uid and course_id query params are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        deleted, _ = UserCourseProgress.objects.filter(user_uid=user_uid, course_id=course_id).delete()
        if deleted:
            return Response({'message': 'Successfully un-enrolled'})
        return Response({'error': 'Course not found in enrollments'}, status=status.HTTP_404_NOT_FOUND)


class TopicProgressView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        course_id = request.query_params.get('course_id')
        
        if not user_uid or not course_id:
             return Response({'error': 'user_uid and course_id are required'}, status=status.HTTP_400_BAD_REQUEST)
             
        completed_topics = TopicProgress.objects.filter(
            user_uid=user_uid, 
            course_id=course_id, 
            completed=True
        ).values_list('topic_id', flat=True)
        
        return Response({
            'completed_topics': list(completed_topics)
        })
        
    def post(self, request, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        course_id = request.data.get('course_id')
        topic_id = request.data.get('topic_id')
        completed = request.data.get('completed', True)
        
        if not all([user_uid, course_id, topic_id]):
             return Response({'error': 'user_uid, course_id, and topic_id are required'}, status=status.HTTP_400_BAD_REQUEST)
             
        progress, _ = TopicProgress.objects.get_or_create(
            user_uid=user_uid,
            course_id=course_id,
            topic_id=topic_id
        )
        
        progress.completed = completed
        progress.save()
        
        # Update last_accessed on the course
        UserCourseProgress.objects.filter(user_uid=user_uid, course_id=course_id).update(last_accessed=progress.completed_at)
        
        return Response({
            'topic_id': topic_id,
            'completed': completed
        })

from .models import QuizQuestion

class CourseQuizView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, course_id, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        
        if not user_uid:
            return Response({'error': 'Login required to take a quiz.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        questions = QuizQuestion.objects.filter(course_id=course_id).order_by('?')[:20]
        
        if not questions:
            return Response({'error': 'No questions found for this course.'}, status=status.HTTP_404_NOT_FOUND)
            
        question_data = [
            {
                'id': q.id,
                'text': q.text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'correct_option': q.correct_option,
                'explanation': q.explanation
            } for q in questions
        ]
        return Response({'questions': question_data})

from .models import QuizResult, UserTimeTracking
from datetime import date

class QuizResultView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        if not user_uid:
            return Response({'error': 'user_uid is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        results = QuizResult.objects.filter(user_uid=user_uid).order_by('-taken_at')
        return Response({
            'results': [
                {
                    'id': r.id,
                    'course_id': r.course_id,
                    'score': r.score,
                    'total_questions': r.total_questions,
                    'taken_at': r.taken_at.isoformat()
                } for r in results
            ]
        })
    
    def post(self, request, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        course_id = request.data.get('course_id')
        score = request.data.get('score')
        total_questions = request.data.get('total_questions')

        if not all([user_uid, course_id, score is not None, total_questions is not None]):
            return Response({'error': 'user_uid, course_id, score, and total_questions are required'}, status=status.HTTP_400_BAD_REQUEST)

        result = QuizResult.objects.create(
            user_uid=user_uid,
            course_id=course_id,
            score=int(score),
            total_questions=int(total_questions)
        )
        return Response({'message': 'Quiz result saved', 'id': result.id}, status=status.HTTP_201_CREATED)

class UserTimeTrackingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user_uid = request.query_params.get('user_uid')
        if not user_uid:
             return Response({'error': 'user_uid is required'}, status=status.HTTP_400_BAD_REQUEST)
             
        tracking = UserTimeTracking.objects.filter(user_uid=user_uid)
        total_time = sum(t.time_spent_seconds for t in tracking)
        
        # Get today's time
        today = date.today()
        today_tracking = tracking.filter(date=today).first()
        today_time = today_tracking.time_spent_seconds if today_tracking else 0

        return Response({
            'total_time_seconds': total_time,
            'today_time_seconds': today_time
        })
        
    def post(self, request, *args, **kwargs):
        user_uid = request.data.get('user_uid')
        seconds = request.data.get('seconds', 30) # default heartbeat assumed 30s
        
        if not user_uid:
            return Response({'error': 'user_uid is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        today = date.today()
        tracking, created = UserTimeTracking.objects.get_or_create(
            user_uid=user_uid,
            date=today,
            defaults={'time_spent_seconds': 0}
        )
        
        tracking.time_spent_seconds += int(seconds)
        tracking.save()
        
        return Response({'message': 'Time updated', 'total_today': tracking.time_spent_seconds})

from .models import CommunityPost, CommunityComment
from django.utils import timezone

class CommunityPostView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-delete posts older than 3 days
        three_days_ago = timezone.now() - timezone.timedelta(days=3)
        CommunityPost.objects.filter(created_at__lt=three_days_ago).delete()
        
        posts = CommunityPost.objects.filter(course_id=course_id).order_by('-created_at')
        post_data = []
        for p in posts:
            post_data.append({
                'id': p.id,
                'user_uid': p.user_uid,
                'user_name': p.user_name,
                'title': p.title,
                'content': p.content,
                'pinned_video_id': p.pinned_video_id,
                'pinned_video_title': p.pinned_video_title,
                'created_at': p.created_at,
                'comment_count': p.comments.count(),
            })
        return Response({'posts': post_data})

    def post(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        user_uid = request.data.get('user_uid')
        user_name = request.data.get('user_name', 'Anonymous')
        title = request.data.get('title')
        content = request.data.get('content')
        pinned_video_id = request.data.get('pinned_video_id')
        pinned_video_title = request.data.get('pinned_video_title')

        if not all([course_id, user_uid, title, content]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        post = CommunityPost.objects.create(
            course_id=course_id,
            user_uid=user_uid,
            user_name=user_name,
            title=title,
            content=content,
            pinned_video_id=pinned_video_id,
            pinned_video_title=pinned_video_title
        )
        return Response({'message': 'Post created', 'post_id': post.id})

    def delete(self, request, *args, **kwargs):
        post_id = request.data.get('post_id') or request.query_params.get('post_id')
        user_uid = request.data.get('user_uid') or request.query_params.get('user_uid')
        
        if not all([post_id, user_uid]):
            return Response({'error': 'Missing post_id or user_uid'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            post = CommunityPost.objects.get(id=post_id, user_uid=user_uid)
            post.delete()
            return Response({'message': 'Post deleted successfully'})
        except CommunityPost.DoesNotExist:
            return Response({'error': 'Post not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

class CommunityCommentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response({'error': 'post_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        comments = CommunityComment.objects.filter(post_id=post_id).order_by('created_at')
        comment_data = []
        for c in comments:
            comment_data.append({
                'id': c.id,
                'user_uid': c.user_uid,
                'user_name': c.user_name,
                'content': c.content,
                'created_at': c.created_at,
            })
        return Response({'comments': comment_data})

    def post(self, request, *args, **kwargs):
        post_id = request.data.get('post_id')
        user_uid = request.data.get('user_uid')
        user_name = request.data.get('user_name', 'Anonymous')
        content = request.data.get('content')

        if not all([post_id, user_uid, content]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            post = CommunityPost.objects.get(id=post_id)
        except CommunityPost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        comment = CommunityComment.objects.create(
            post=post,
            user_uid=user_uid,
            user_name=user_name,
            content=content
        )
        return Response({'message': 'Comment created', 'comment_id': comment.id})
