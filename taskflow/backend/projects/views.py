from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from tasks.models import Task

from .models import Project
from .serializers import ProjectQuerySerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Project.objects.none()

        query = ProjectQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        params = query.validated_data

        queryset = Project.objects.filter(owner=self.request.user).annotate(
            task_count=Count("tasks", distinct=True),
            completed_task_count=Count(
                "tasks",
                filter=Q(tasks__status=Task.Status.DONE),
                distinct=True,
            ),
        )

        archived = params.get("archived", "active")
        if self.action == "list":
            if archived == "active":
                queryset = queryset.filter(is_archived=False)
            elif archived == "archived":
                queryset = queryset.filter(is_archived=True)

        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return queryset.order_by(params.get("ordering", "-updated_at"))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner_id != self.request.user.id:
            raise ValidationError("You cannot modify this project.")
        serializer.save()
