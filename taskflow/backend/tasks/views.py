from datetime import timedelta

from django.db.models import Case, F, IntegerField, Q, Value, When
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from projects.models import Project

from .models import Task
from .serializers import TaskQuerySerializer, TaskSerializer

PRIORITY_RANK = Case(
    When(priority=Task.Priority.URGENT, then=Value(0)),
    When(priority=Task.Priority.HIGH, then=Value(1)),
    When(priority=Task.Priority.MEDIUM, then=Value(2)),
    When(priority=Task.Priority.LOW, then=Value(3)),
    default=Value(4),
    output_field=IntegerField(),
)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()

        query = TaskQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        params = query.validated_data

        queryset = Task.objects.filter(owner=self.request.user).select_related(
            "project"
        )

        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        priority_value = params.get("priority")
        if priority_value:
            queryset = queryset.filter(priority=priority_value)

        project_id = params.get("project")
        if project_id:
            if not Project.objects.filter(
                pk=project_id, owner=self.request.user
            ).exists():
                raise ValidationError({"project": "Project not found."})
            queryset = queryset.filter(project_id=project_id)

        today = timezone.localdate()
        due = params.get("due")
        if due == "overdue":
            queryset = queryset.filter(
                due_date__lt=today,
            ).exclude(status=Task.Status.DONE)
        elif due == "today":
            queryset = queryset.filter(due_date=today)
        elif due == "upcoming":
            queryset = queryset.filter(
                due_date__gt=today,
                due_date__lte=today + timedelta(days=7),
            ).exclude(status=Task.Status.DONE)
        elif due == "none":
            queryset = queryset.filter(due_date__isnull=True)

        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(project__name__icontains=search)
            )

        ordering = params.get("ordering", "-updated_at")
        if ordering == "priority":
            queryset = queryset.annotate(priority_rank=PRIORITY_RANK).order_by(
                "priority_rank", "-updated_at"
            )
        elif ordering == "-priority":
            queryset = queryset.annotate(priority_rank=PRIORITY_RANK).order_by(
                "-priority_rank", "-updated_at"
            )
        elif ordering == "due_date":
            queryset = queryset.order_by(
                F("due_date").asc(nulls_last=True), "-updated_at"
            )
        elif ordering == "-due_date":
            queryset = queryset.order_by(
                F("due_date").desc(nulls_last=True), "-updated_at"
            )
        else:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
