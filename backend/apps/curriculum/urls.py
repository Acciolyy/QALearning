from django.urls import path
from .views import TrackListAPIView, TrackDetailAPIView, TopicDetailAPIView

app_name = 'curriculum'

urlpatterns = [
    path('tracks/', TrackListAPIView.as_view(), name='track-list'),
    path('tracks/<slug:slug>/', TrackDetailAPIView.as_view(), name='track-detail'),
    path('topics/<slug:slug>/', TopicDetailAPIView.as_view(), name='topic-detail'),
]
