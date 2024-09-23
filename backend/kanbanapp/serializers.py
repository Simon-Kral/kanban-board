from rest_framework import serializers
from .models import CustomUser, Contact, Task, Subtask

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = CustomUser 
        fields = ['id', 'password', 'email']

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'color']
        depth = 1

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'