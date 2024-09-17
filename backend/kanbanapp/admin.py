from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

from kanbanapp.models import Subtask, Task

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ("id", "email", "first_name", "last_name", "is_staff", "is_active",)
    list_filter = ("id", "email", "first_name", "last_name", "is_staff", "is_active",)
    fieldsets = (
        (None, {"fields": ("email", "password", ("first_name", "last_name", "initials", "color"))}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "password1", "password2", "first_name", "last_name", "initials", "color", "is_staff",
                "is_active", "groups", "user_permissions"
            )}
        ),
    )
    search_fields = ("email",)
    ordering = ("email",)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Task)
admin.site.register(Subtask)