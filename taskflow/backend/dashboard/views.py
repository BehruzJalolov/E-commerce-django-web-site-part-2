from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import DashboardSerializer
from .services import build_dashboard


class DashboardView(APIView):
    @extend_schema(responses=DashboardSerializer)
    def get(self, request):
        return Response(build_dashboard(request.user, request))
