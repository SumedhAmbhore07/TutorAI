import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
from PyPDF2 import PdfReader

class UploadPDFView(APIView):
    parser_classes = (MultiPartParser, FormParser)

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
