from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/curriculum/', include('apps.curriculum.urls')),
    path('mini-sites/', include('apps.mini_sites.urls')),
]
