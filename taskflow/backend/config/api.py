from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import schema  # noqa: F401  (registers the session auth OpenAPI extension)
from .serializers import ApiIndexSerializer, HealthSerializer


@extend_schema(responses={200: HealthSerializer})
@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "taskflow-api", "version": "1.0.0"})


@extend_schema(responses={200: ApiIndexSerializer})
@api_view(["GET"])
@permission_classes([AllowAny])
def api_index(request):
    return Response(
        {
            "name": "TaskFlow API",
            "version": "1.0.0",
            "documentation": "/api/docs/",
            "schema": "/api/schema/",
            "endpoints": {
                "auth": "/api/v1/auth/",
                "projects": "/api/v1/projects/",
                "tasks": "/api/v1/tasks/",
                "dashboard": "/api/v1/dashboard/",
                "health": "/api/v1/health/",
            },
        }
    )
