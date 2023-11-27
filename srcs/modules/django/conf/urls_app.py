# myapp/urls.py
from django.urls import path, re_path
from .views import index_view
from django.views.generic.base import RedirectView

urlpatterns = [
    # path('', RedirectView.as_view(pattern_name='index-view', permanent=False)),
    path('', index_view, name='index-view'),
    re_path(r'^.*/?$', index_view, name='catch-all'),
]
