from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "is_archived", "created_at", "updated_at")
    list_filter = ("is_archived", "created_at")
    search_fields = ("name", "description", "owner__username", "owner__email")
    raw_id_fields = ("owner",)
    date_hierarchy = "created_at"
