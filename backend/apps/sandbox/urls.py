from django.urls import path
from .views import RunCodeAPIView, VerifyCodeAPIView

urlpatterns = [
    path('run/', RunCodeAPIView.as_view(), name='sandbox-run'),
    path('verify/', VerifyCodeAPIView.as_view(), name='sandbox-verify'),
]
