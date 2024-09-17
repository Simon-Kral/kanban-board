from rest_framework import serializers
from .models import CustomUser, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = CustomUser 
        fields = ['id', 'password', 'email', 'first_name', 'last_name', 'initials', 'color']

class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'initials', 'color']
        depth = 1

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'