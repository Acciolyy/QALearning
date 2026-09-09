from django.urls import path
from .views import SubmissionAPIView

app_name = 'evaluation'

urlpatterns = [
    path('submit/', SubmissionAPIView.as_view(), name='submission_submit'),
]
