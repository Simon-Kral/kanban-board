"""
URL configuration for kanbanboard project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework import routers

from kanbanapp.views import LoginView, SignupView, CurrentUserView, ContactView, TaskView, SubtaskView, TestTokenView


router = routers.DefaultRouter()
router.register(r'contacts', ContactView, basename='Contact')
router.register(r'tasks', TaskView, basename='Task')
router.register(r'subtasks', SubtaskView, basename='Subtask')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view()),
    path('api/signup/', SignupView.as_view()),
    path('api/user/', CurrentUserView.as_view()),
    path('api/', include(router.urls)),
    path('test_token/', TestTokenView.as_view()),
]
