from django.urls import path
from .views import UploadPDFView, AskAIView

urlpatterns = [
    path('upload-pdf/', UploadPDFView.as_view(), name='upload_pdf'),
    path('ask/', AskAIView.as_view(), name='ask_ai'),
]
