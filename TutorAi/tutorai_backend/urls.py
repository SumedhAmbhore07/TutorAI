"""
URL configuration for tutorai_backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, Http404
from django.views.static import serve
import os
import mimetypes

def serve_react_app(request):
    """Serve the React index.html for all non-API, non-static routes"""
    index_path = os.path.join(settings.BASE_DIR, 'static', 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'))
    raise Http404("index.html not found")

# URL patterns - ORDER MATTERS! More specific patterns first
urlpatterns = [
    # 1. API and admin (most specific)
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # 2. Static assets using Django's serve view
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'static', 'assets'),
        'show_indexes': False,
    }),
    
    # 3. Root static files
    re_path(r'^(?P<path>vite\.svg|favicon\.ico|robots\.txt)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'static'),
        'show_indexes': False,
    }),
    
    # 4. Root URL - React app
    path('', serve_react_app, name='home'),
    
    # 5. Catch-all for React Router (must be LAST)
    re_path(r'^.*/$', serve_react_app),
]

# Serve media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
