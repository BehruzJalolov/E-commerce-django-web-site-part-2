from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

HEX_COLOR_VALIDATOR = RegexValidator(
    regex=r"^#[0-9a-fA-F]{6}$",
    message="Enter a valid hex colour such as #6366f1.",
)


class Project(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    name = models.CharField(max_length=120)
    description = models.TextField(max_length=2000, blank=True)
    color = models.CharField(
        max_length=7,
        default="#6366f1",
        validators=[HEX_COLOR_VALIDATOR],
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"],
                name="unique_project_name_per_owner",
            ),
            models.CheckConstraint(
                condition=models.Q(color__regex=r"^#[0-9a-fA-F]{6}$"),
                name="project_color_is_hex",
            ),
        ]
        indexes = [
            models.Index(fields=["owner", "is_archived"]),
            models.Index(fields=["owner", "updated_at"]),
        ]

    def __str__(self):
        return self.name
