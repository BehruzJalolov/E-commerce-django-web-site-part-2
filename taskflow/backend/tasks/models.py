from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from projects.models import Project


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=5000, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(
                    status__in=["todo", "in_progress", "done"]
                ),
                name="task_status_is_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    priority__in=["low", "medium", "high", "urgent"]
                ),
                name="task_priority_is_valid",
            ),
        ]
        indexes = [
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["owner", "due_date"]),
            models.Index(fields=["owner", "priority"]),
            models.Index(fields=["project", "status"]),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if (
            self.project_id
            and self.owner_id
            and self.project.owner_id != self.owner_id
        ):
            raise ValidationError(
                {"project": "The selected project does not belong to you."}
            )

    def save(self, *args, **kwargs):
        if self.status == self.Status.DONE and self.completed_at is None:
            self.completed_at = timezone.now()
        elif self.status != self.Status.DONE:
            self.completed_at = None
        super().save(*args, **kwargs)

    @property
    def is_completed(self):
        return self.status == self.Status.DONE

    @property
    def is_overdue(self):
        return bool(
            not self.is_completed
            and self.due_date
            and self.due_date < timezone.localdate()
        )
