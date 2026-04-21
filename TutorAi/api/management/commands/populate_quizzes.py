from django.core.management.base import BaseCommand
from api.models import QuizQuestion
import random

class Command(BaseCommand):
    help = 'Populates the database with 100 quiz questions for all active courses'

    def handle(self, *args, **kwargs):
        courses = {
            'dsa': 'Data Structures & Algorithms',
            'web-dev': 'Web Development',
            'python': 'Python Programming',
            'dbms': 'Database Management Systems',
            'oop': 'Object-Oriented Programming',
            'ai-ml': 'AI & Machine Learning',
            'data-science': 'Data Science & Analytics',
            'cybersecurity': 'Cybersecurity & Ethical Hacking',
            'os-networks': 'Operating Systems & Networks',
            'mobile-dev': 'Mobile App Development'
        }

        # Clear existing questions so we don't duplicate on multiple runs
        QuizQuestion.objects.all().delete()
        self.stdout.write(self.style.WARNING("Cleared existing quiz questions."))

        questions_to_create = []

        for course_id, course_name in courses.items():
            for i in range(1, 101):
                # Generic but context-aware questions
                topic_focus = ["basics", "advanced concepts", "syntax", "implementation", "best practices"]
                focus = random.choice(topic_focus)
                
                correct_ans = random.choice(['A', 'B', 'C', 'D'])
                
                q = QuizQuestion(
                    course_id=course_id,
                    text=f"Question {i} about {course_name}: Which of the following best describes {focus} in this context?",
                    option_a=f"A common approach to solving {focus} problems." if correct_ans == 'A' else f"Incorrect assumption 1 for {focus}",
                    option_b=f"The primary standard for {focus}." if correct_ans == 'B' else f"Incorrect assumption 2 for {focus}",
                    option_c=f"An optimized way to handle {focus}." if correct_ans == 'C' else f"Incorrect assumption 3 for {focus}",
                    option_d=f"The default behavior regarding {focus}." if correct_ans == 'D' else f"Incorrect assumption 4 for {focus}",
                    correct_option=correct_ans,
                    explanation=f"This is the correct explanation for question {i} regarding {focus} in {course_name}. It helps solidify the foundational knowledge."
                )
                questions_to_create.append(q)

        # Bulk create for efficiency
        QuizQuestion.objects.bulk_create(questions_to_create)

        self.stdout.write(self.style.SUCCESS(f"Successfully populated {len(questions_to_create)} quiz questions (100 per course)."))
