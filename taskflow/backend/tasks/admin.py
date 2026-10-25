from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "owner",
        "project",
        "status",
        "priority",
        "due_date",
        "updated_at",
    )
    list_filter = ("status", "priority", "project")
    search_fields = ("title", "description", "owner__username", "project__name")
    raw_id_fields = ("owner",)
    date_hierarchy = "created_at"
    list_select_related = ("owner", "project")
