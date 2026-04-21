from django.db import models

class VideoLike(models.Model):
    video_id = models.CharField(max_length=255, db_index=True)
    user_uid = models.CharField(max_length=255) # Firebase User UID

    class Meta:
        unique_together = ('video_id', 'user_uid')

class VideoComment(models.Model):
    video_id = models.CharField(max_length=255, db_index=True)
    user_uid = models.CharField(max_length=255) # Firebase User UID
    user_name = models.CharField(max_length=100)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class UserCourseProgress(models.Model):
    user_uid = models.CharField(max_length=255, db_index=True)
    course_id = models.CharField(max_length=255, db_index=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_uid', 'course_id')
        ordering = ['-last_accessed']

class TopicProgress(models.Model):
    user_uid = models.CharField(max_length=255, db_index=True)
    course_id = models.CharField(max_length=255)
    topic_id = models.CharField(max_length=255, db_index=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_uid', 'course_id', 'topic_id')

class QuizQuestion(models.Model):
    course_id = models.CharField(max_length=255, db_index=True)
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)  # 'A', 'B', 'C', or 'D'
    explanation = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"[{self.course_id}] {self.text[:50]}"

class QuizResult(models.Model):
    user_uid = models.CharField(max_length=255, db_index=True)
    course_id = models.CharField(max_length=255, db_index=True)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-taken_at']

class UserTimeTracking(models.Model):
    user_uid = models.CharField(max_length=255, db_index=True)
    date = models.DateField(auto_now_add=True) # or we can specify it manually, but auto_now_add is fine for "today"
    time_spent_seconds = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user_uid', 'date')

class CommunityPost(models.Model):
    course_id = models.CharField(max_length=255, db_index=True)
    user_uid = models.CharField(max_length=255)
    user_name = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    content = models.TextField()
    pinned_video_id = models.CharField(max_length=255, blank=True, null=True)
    pinned_video_title = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class CommunityComment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user_uid = models.CharField(max_length=255)
    user_name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
