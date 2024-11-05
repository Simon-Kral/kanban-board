from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from .api.managers import CustomUserManager
from django.db import models
from django.conf import settings
import datetime

# Create your models here.


class CustomUser(AbstractUser):
    """
    Custom user model that replaces the username field with email as the unique identifier.
    Uses CustomUserManager to handle user creation and authentication.
    """
    username = None
    email = models.EmailField(_("email address"), unique=True)

    # Use the custom user manager for creating users and superusers.
    objects = CustomUserManager()

    # Set email as the primary field for authentication.
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        # Return the user's email as the string representation.
        return self.email


class Contact(models.Model):
    """
    Model representing a contact associated with a specific user (author).
    Stores basic contact information including name, email, phone, and a color code.
    """
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(_("email address"))
    phone = models.CharField(max_length=30, blank=True)
    # Default color set to orange.
    color = models.CharField(max_length=7, default='#FF7A00')

    def __str__(self):
        # Return the contact's email as the string representation.
        return self.email

    class Meta:
        # Ensure each author has unique contacts by email.
        unique_together = ['author', 'email']


class Task(models.Model):
    """
    Model representing a task, which may be assigned to one or more contacts.
    Includes information about the task's creation date, status, priority, due date, and category.
    """
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateField(default=datetime.date.today)
    # Default status set to 'todo'.
    status = models.CharField(max_length=15, default='todo')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ManyToManyField(
        # Allows multiple contacts to be assigned.
        Contact, related_name='contacts', blank=True)
    due_date = models.DateField()
    prio = models.IntegerField()  # Integer field representing priority level.
    category = models.CharField(max_length=50)

    def __str__(self):
        # Return the task's title as the string representation.
        return self.title


class Subtask(models.Model):
    """
    Model representing a subtask linked to a parent task.
    Contains a title and a boolean field to indicate completion status.
    """
    task = models.ForeignKey(
        # ForeignKey link to a parent task.
        Task, related_name='subtasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    done = models.BooleanField(default=0)  # Default set to not done (0).

    def __str__(self):
        # Return the subtask's title as the string representation.
        return self.title
