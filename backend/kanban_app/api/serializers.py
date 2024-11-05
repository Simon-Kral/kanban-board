from rest_framework import serializers
from ..models import CustomUser, Contact, Task, Subtask


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model.
    Serializes the fields 'id', 'email', 'first_name', and 'last_name' for user data.
    """

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for the Contact model.
    Serializes all fields in the Contact model and includes a unique constraint on
    the combination of 'email' and 'author' fields to ensure unique contacts per user.
    """

    class Meta:
        model = Contact
        fields = '__all__'
        validators = [
            # Enforces a unique constraint on the 'email' and 'author' fields combined,
            # returning a specific error message if a duplicate contact is detected.
            serializers.UniqueTogetherValidator(
                queryset=Contact.objects.all(),
                fields=('email', 'author'),
                message="This email already exists."
            )
        ]


class SubtaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subtask model.
    Serializes all fields in the Subtask model.
    """

    class Meta:
        model = Subtask
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    Includes all fields in the Task model and a nested serialization for subtasks.
    """

    # Nested serializer for related subtasks, making them read-only within the task context.
    subtasks = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
