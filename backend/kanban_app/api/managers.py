from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user manager with validation for creating both user and superuser instances.
    """

    def create_user(self, email, password, **extra_fields):
        """
        Creates and saves a regular user with the given email and password.

        Args:
            email (str): The email of the user.
            password (str): The password for the user.
            \**extra_fields: Additional fields for the user model.

        Raises:
            ValueError: If the email is not provided.

        Returns:
            CustomUser: A user instance.
        """

        if not email:
            raise ValueError(_("The Email must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Creates and saves a superuser with the given email and password, ensuring necessary permissions.

        Args:
            email (str): The email of the superuser.
            password (str): The password for the superuser.
            \**extra_fields: Additional fields for the superuser model.

        Raises:
            ValueError: If required permissions (is_staff, is_superuser) are not set.

        Returns:
            CustomUser: A superuser instance.
        """

        # Ensure the superuser has required fields set to True
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(email, password, **extra_fields)
