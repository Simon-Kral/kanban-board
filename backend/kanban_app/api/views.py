from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status,  viewsets
from ..models import CustomUser, Contact, Task, Subtask
from .serializers import UserSerializer, ContactSerializer, TaskSerializer, SubtaskSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class SignupView(ObtainAuthToken):
    """ 
    SignupView handles user registration and token generation.
    It inherits from ObtainAuthToken to simplify token handling.
    """

    def post(self, request):
        """ 
        Registers a new user, sets their password, and creates an authentication token.
        """
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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(ObtainAuthToken):
    """ 
    LoginView handles user login by verifying credentials and returning a token.
    """

    def post(self, request):
        """ 
        Authenticates the user and returns an authentication token if successful.
        """
        try:
            user = CustomUser.objects.get(email=request.data['email'])
            if not user.check_password(request.data['password']):
                return Response({'message': 'wrong password'}, status=status.HTTP_400_BAD_REQUEST)
            token, created = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(user)
            return Response({'token': token.key, 'user': serializer.data})
        except:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def guest_user_view(request):
    """ 
    Checks if a guest user with a specific email exists in the system.
    """
    if request.method == 'GET':
        user = CustomUser.objects.filter(email='max@mail.com')
        if user:
            return Response({'exists': True})
        return Response({'exists': False})


@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """ 
    Allows authenticated users to view or update their own profile information.
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})

    if request.method == 'POST':
        try:
            user = CustomUser.objects.get(id=request.user.id)
            user.first_name = request.data['first_name']
            user.last_name = request.data['last_name']
            user.email = request.data['email']
            user.save()
            serializer = UserSerializer(user)
            return Response({'user': serializer.data})
        except:
            return Response({'message': 'user with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)


class ContactViewSet(viewsets.ModelViewSet):
    """ 
    Provides CRUD operations for Contact objects belonging to the authenticated user.
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer

    def get_queryset(self):
        """ 
        Restricts the queryset to contacts created by the authenticated user.
        """
        return Contact.objects.filter(author=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    """ 
    Provides CRUD operations for Task objects belonging to the authenticated user.
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        """ 
        Restricts the queryset to tasks created by the authenticated user.
        """
        return Task.objects.filter(author=self.request.user)


class SubtaskViewSet(viewsets.ModelViewSet):
    """ 
    Provides CRUD operations for all Subtask objects.
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer


@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def summary_view(request):
    """ 
    Provides a summary of the user's tasks, including counts by status and urgency.
    """
    if request.method == 'GET':
        all_tasks = len(Task.objects.filter(author=request.user))
        todo = len(Task.objects.filter(status='todo', author=request.user))
        in_progress = len(Task.objects.filter(
            status='inProgress', author=request.user))
        await_feedback = len(Task.objects.filter(
            status='awaitFeedback', author=request.user))
        done = len(Task.objects.filter(status='done', author=request.user))
        urgent = len(Task.objects.filter(prio=1, author=request.user))

        if urgent > 0:
            most_urgent_date = Task.objects.filter(
                prio=1, author=request.user).order_by('due_date').first().due_date
        else:
            most_urgent_date = '1970-01-01'

        return Response({
            'allTasks': {'count': all_tasks},
            'todo': {'count': todo},
            'in_progress': {'count': in_progress},
            'await_feedback': {'count': await_feedback},
            'done': {'count': done},
            'urgent': {'count': urgent, 'most_urgent_date': most_urgent_date},
        })
