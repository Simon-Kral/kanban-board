from rest_framework.authentication import  TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken

from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework import viewsets

from .serializers import UserSerializer, ContactSerializer, TaskSerializer, SubtaskSerializer

from .models import CustomUser, Contact, Task, Subtask

from rest_framework.views import APIView


class SignupView(ObtainAuthToken):

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user = CustomUser.objects.get(email=request.data['email'])
            user.set_password(request.data['password'])
            user.first_name = request.data['first_name']
            user.last_name = request.data['last_name']
            user.save()
            token = Token.objects.create(user=user)
            return Response({'token': token.key, 'user': serializer.data})
        return Response(serializer.errors, status=status.HTTP_200_OK)


class LoginView(ObtainAuthToken):

    def post(self, request):    
        user = get_object_or_404(CustomUser, email=request.data['email'])
        if not user.check_password(request.data['password']):
            return Response("missing user", status=status.HTTP_404_NOT_FOUND)
        token, created = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        return Response({'token': token.key, 'user': serializer.data})


class TestTokenView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response("passed!")


class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,     
            'last_name': user.last_name,
        })

class ContactView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get(self, request):
        contacts = Contact.objects.filter(author=request.user)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer)

class TaskView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def create(self, request):
        task = Task.objects.create(author=request.user, title=request.data.get('title', ''), description=request.data.get('description', ''), due_date=request.data.get('due_date', ''), prio=request.data.get('prio', ''), category=request.data.get('category', ''), status=request.data.get('status', ''))
        assigned_to_users = Contact.objects.filter(pk__in=request.data.get('assigned_to', ''))
        task.assigned_to.add(*assigned_to_users)
        task.save()
        for subtask in request.data.get('subtasks', ''):
            Subtask.objects.create(task=task, title=subtask)
        serializer = TaskSerializer(task)
        return Response(serializer.data)  

class SubtaskView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer

