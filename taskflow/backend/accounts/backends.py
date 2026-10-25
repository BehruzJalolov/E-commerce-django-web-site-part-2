from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """Authenticate with either an exact username or an email address."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if username is None or password is None:
            return None

        lookup = username.strip()
        user = UserModel.objects.filter(username__iexact=lookup).first()
        if user is None:
            user = UserModel.objects.filter(email__iexact=lookup).first()

        if user is None:
            # Keep password hashing costs similar for unknown accounts.
            UserModel().set_password(password)
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
