from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from .managers import CustomUserManager
import datetime

def getInitials(first_name, last_name):
    return first_name[0].upper() + last_name[0].upper()

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    initials = models.CharField(max_length=50, default='')
    color = models.CharField(max_length=7, default='#FF7A00')

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()


    def __str__(self):
        return self.email

class Task(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateField(default=datetime.date.today)
    status = models.CharField(max_length=15, default='todo')
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    assigned_to = models.ManyToManyField(CustomUser, related_name='assigned_to_users', blank=True)
    due_date = models.DateField(default=datetime.date.today)
    prio = models.IntegerField(default=1)
    category = models.CharField(max_length=50)

    def __str__(self):
        return f'[{self.id}]  [Prio: {self.prio}]  [Status: {self.status}]  {self.title}'

class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    done = models.BooleanField(default=0)

    def __str__(self):
        return self.title