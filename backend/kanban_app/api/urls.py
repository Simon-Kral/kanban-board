from django.urls import path, include
from .views import SignupView, LoginView, current_user_view, ContactViewSet, TaskViewSet, SubtaskViewSet, summary_view, guest_user_view
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'contacts', ContactViewSet, basename='contacts')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'subtasks', SubtaskViewSet, basename='subtasks')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path('user/', current_user_view),
    path('summary/', summary_view),
    path('guest/', guest_user_view),
]
