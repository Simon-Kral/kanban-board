from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from ..models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    """
    Form for creating a new user, extending Django's UserCreationForm.
    Uses CustomUser as the model and includes only the 'email' field.
    """

    class Meta:
        model = CustomUser
        fields = ("email",)


class CustomUserChangeForm(UserChangeForm):
    """
    Form for updating an existing user's information, extending Django's UserChangeForm.
    Uses CustomUser as the model and includes only the 'email' field for updates.
    """

    class Meta:
        model = CustomUser
        fields = ("email",)
