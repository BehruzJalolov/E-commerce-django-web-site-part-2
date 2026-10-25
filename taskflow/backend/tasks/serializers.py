from rest_framework import serializers

from projects.models import Project
from projects.serializers import ProjectMiniSerializer

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.none())
    project_detail = ProjectMiniSerializer(source="project", read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )
    is_completed = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "status_display",
            "priority",
            "priority_display",
            "project",
            "project_detail",
            "due_date",
            "is_completed",
            "is_overdue",
            "completed_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status_display",
            "priority_display",
            "project_detail",
            "is_completed",
            "is_overdue",
            "completed_at",
            "created_at",
            "updated_at",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["project"].queryset = Project.objects.filter(
                owner=request.user
            )
        else:
            self.fields["project"].queryset = Project.objects.none()

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title is required.")
        return value

    def validate_description(self, value):
        return value.strip()


class TaskQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Task.Status.choices,
        required=False,
    )
    priority = serializers.ChoiceField(
        choices=Task.Priority.choices,
        required=False,
    )
    project = serializers.IntegerField(required=False, min_value=1)
    due = serializers.ChoiceField(
        choices=("overdue", "today", "upcoming", "none"),
        required=False,
    )
    search = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )
    ordering = serializers.ChoiceField(
        choices=(
            "-updated_at",
            "updated_at",
            "-created_at",
            "created_at",
            "due_date",
            "-due_date",
            "priority",
            "-priority",
            "title",
            "-title",
        ),
        required=False,
        default="-updated_at",
    )
