from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from .managers import CustomUserManager
import datetime


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()


    def __str__(self):
        return self.email

class Contact(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(_("email address"), unique=True)
    phone = models.CharField(max_length=30)
    color = models.CharField(max_length=7, default='#FF7A00')

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Task(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateField(default=datetime.date.today)
    status = models.CharField(max_length=15, default='todo')
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200, blank=True)
    assigned_to = models.ManyToManyField(Contact, related_name='assigned_to_users', blank=True)
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