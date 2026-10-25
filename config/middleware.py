from django.conf import settings
from django.core.exceptions import PermissionDenied


class AdminAccessMiddleware:
    """Require a superuser for every request under the secret admin path."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        admin_prefix = f"/{settings.ADMIN_URL}"
        if request.path.startswith(admin_prefix):
            user = request.user
            if user.is_authenticated and not user.is_superuser:
                raise PermissionDenied(
                    "Admin panelga faqat superuser kira oladi."
                )
            response = self.get_response(request)
            response["X-Robots-Tag"] = "noindex, nofollow"
            response["Cache-Control"] = "no-store"
            return response
        return self.get_response(request)
