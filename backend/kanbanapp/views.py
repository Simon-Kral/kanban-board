from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token

from .serializers import UserSerializer, TaskSerializer, ContactsSerializer

from .models import CustomUser, Task, Subtask

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = CustomUser.objects.get(email=request.data['email'])
        user.set_password(request.data['password'])
        user.first_name = request.data['first_name']
        user.last_name = request.data['last_name']
        user.initials = request.data['first_name'][0].upper() + request.data['last_name'][0].upper()
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'user': serializer.data})
    return Response(serializer.errors, status=status.HTTP_200_OK)

@api_view(['POST'])
def login(request):
    user = get_object_or_404(CustomUser, email=request.data['email'])
    if not user.check_password(request.data['password']):
        return Response("missing user", status=status.HTTP_404_NOT_FOUND)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    return Response({'token': token.key, 'user': serializer.data})

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response("passed!")

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'email': user.email,
        'first_name': user.first_name,     
        'last_name': user.last_name,
        'initials': user.initials,
        'color': user.color 
    })

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def contacts(request):
    contacts = CustomUser.objects.all()
    serializer = ContactsSerializer(contacts, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def tasks(request):
    tasks = Task.objects.all()
    subtasks = Subtask.objects.all()
    # tasks = TaskItem.objects.filter(author=request.user)
    serializer = TaskSerializer(tasks, many=True)
    if request.method == 'POST':
        task = Task.objects.create(author=request.user, title=request.data.get('title', ''), description=request.data.get('description', ''), due_date=request.data.get('due_date', ''), prio=request.data.get('prio', ''), category=request.data.get('category', ''))

        assigned_to_users = CustomUser.objects.filter(pk__in=request.data.get('assigned_to', ''))
        task.assigned_to.add(*assigned_to_users)
        task.save()

        for subtask in request.data.get('subtasks', ''):
            new_subtask = Subtask.objects.create(task=task, title=subtask)
        return Response('task created')

    return Response(serializer.data)