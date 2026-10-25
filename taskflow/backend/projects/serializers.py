from rest_framework import serializers

from .models import Project


class ProjectMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "color", "is_archived")
        read_only_fields = fields


class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    open_task_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "color",
            "is_archived",
            "task_count",
            "completed_task_count",
            "open_task_count",
            "completion_percentage",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "task_count",
            "completed_task_count",
            "open_task_count",
            "completion_percentage",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Project name is required.")
        return value

    def validate_color(self, value):
        value = value.strip()
        if (
            len(value) != 7
            or not value.startswith("#")
            or any(char not in "0123456789abcdefABCDEF" for char in value[1:])
        ):
            raise serializers.ValidationError(
                "Enter a valid hex colour such as #6366f1."
            )
        return value.lower()

    def validate(self, attrs):
        name = attrs.get("name", getattr(self.instance, "name", ""))
        request = self.context.get("request")
        if request and name:
            duplicates = Project.objects.filter(
                owner=request.user,
                name__iexact=name,
            )
            if self.instance:
                duplicates = duplicates.exclude(pk=self.instance.pk)
            if duplicates.exists():
                raise serializers.ValidationError(
                    {"name": "You already have a project with this name."}
                )
        return attrs

    def _count(self, obj, field, fallback):
        value = getattr(obj, field, None)
        if value is None:
            return fallback()
        return value

    def get_task_count(self, obj) -> int:
        return self._count(obj, "task_count", lambda: obj.tasks.count())

    def get_completed_task_count(self, obj) -> int:
        return self._count(
            obj,
            "completed_task_count",
            lambda: obj.tasks.filter(status="done").count(),
        )

    def get_open_task_count(self, obj) -> int:
        return self.get_task_count(obj) - self.get_completed_task_count(obj)

    def get_completion_percentage(self, obj) -> int:
        total = self.get_task_count(obj)
        if not total:
            return 0
        return round(self.get_completed_task_count(obj) / total * 100)


class ProjectQuerySerializer(serializers.Serializer):
    archived = serializers.ChoiceField(
        choices=("active", "archived", "all"),
        required=False,
        default="active",
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
            "name",
            "-name",
        ),
        required=False,
        default="-updated_at",
    )
