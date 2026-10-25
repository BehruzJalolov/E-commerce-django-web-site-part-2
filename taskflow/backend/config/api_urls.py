from django.urls import include, path
from rest_framework.routers import DefaultRouter

from dashboard.views import DashboardView
from projects.views import ProjectViewSet
from tasks.views import TaskViewSet

from .api import api_index, health

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("", api_index, name="api-index"),
    path("health/", health, name="api-health"),
    path("auth/", include("accounts.urls")),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]
