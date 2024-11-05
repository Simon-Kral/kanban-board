from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .api.forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, Subtask, Task, Contact

# Register your models here.


class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for the CustomUser model.
    Extends Django's UserAdmin to use custom user creation and change forms.
    """
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    # Fields to display in the user list view in the admin panel.
    list_display = ("email", "id", "first_name", "last_name")

    # Filters available in the admin list view for filtering users by these fields.
    list_filter = ("email", "id", "first_name", "last_name")

    # Fields displayed on the user detail view, organized into sections.
    fieldsets = (
        (None, {"fields": ("email", "password", ("first_name", "last_name"))}),
        ("Permissions", {"fields": ("is_staff",
         "is_active", "groups", "user_permissions")}),
    )

    # Fields shown when adding a new user, including extra options for staff and permissions.
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "password1", "password2", "is_staff",
                "is_active", "groups", "user_permissions"
            )}
         ),
    )

    # Fields to search within the admin panel.
    search_fields = ("email", "first_name", "last_name")

    # Default ordering in the user list view.
    ordering = ("email",)


class ContactAdmin(admin.ModelAdmin):
    """
    Custom admin configuration for the Contact model.
    Displays specific fields in the list view.
    """
    model = Contact
    list_display = ("email", "id", "last_name", "first_name", "author")


class TaskAdmin(admin.ModelAdmin):
    """
    Custom admin configuration for the Task model.
    Displays the title, id, and author of each task in the list view.
    """
    model = Task
    list_display = ("title", "id", "author")


# Registering models to make them accessible through the Django admin interface.
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(Subtask)
