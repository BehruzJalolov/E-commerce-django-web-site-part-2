from rest_framework.authentication import SessionAuthentication as DRFSessionAuthentication


class SessionAuthentication(DRFSessionAuthentication):
    """Session authentication that returns 401 instead of 403 for guests."""

    def authenticate_header(self, request):
        return "Session"
