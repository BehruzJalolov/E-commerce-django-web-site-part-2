from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class TaskFlowSessionAuthenticationScheme(OpenApiAuthenticationExtension):
    """Describe the custom session authenticator in the OpenAPI schema."""

    target_class = "config.authentication.SessionAuthentication"
    name = "cookieAuth"
    priority = 1

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": settings.SESSION_COOKIE_NAME,
            "description": (
                "HTTP-only session cookie. State-changing requests must also "
                "send the X-CSRFToken header."
            ),
        }
