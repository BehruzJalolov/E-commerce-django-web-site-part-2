from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from projects.models import Project
from tasks.models import Task
from tasks.serializers import TaskSerializer


def build_dashboard(user, request) -> dict:
    today = timezone.localdate()
    tasks = Task.objects.filter(owner=user)
    projects = Project.objects.filter(owner=user)

    counts = tasks.aggregate(
        total=Count("id"),
        todo=Count("id", filter=Q(status=Task.Status.TODO)),
        in_progress=Count(
            "id", filter=Q(status=Task.Status.IN_PROGRESS)
        ),
        completed=Count("id", filter=Q(status=Task.Status.DONE)),
        overdue=Count(
            "id",
            filter=Q(due_date__lt=today)
            & Q(status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS]),
        ),
        low=Count("id", filter=Q(priority=Task.Priority.LOW)),
        medium=Count("id", filter=Q(priority=Task.Priority.MEDIUM)),
        high=Count("id", filter=Q(priority=Task.Priority.HIGH)),
        urgent=Count("id", filter=Q(priority=Task.Priority.URGENT)),
    )
    total = counts["total"]
    completion = round(counts["completed"] / total * 100) if total else 0

    project_total = projects.count()
    active_projects = projects.filter(is_archived=False)

    project_rows = list(
        active_projects.annotate(
            task_count=Count("tasks"),
            completed_task_count=Count(
                "tasks", filter=Q(tasks__status=Task.Status.DONE)
            ),
        )
        .order_by("-updated_at")[:6]
    )
    project_data = [
        {
            "id": project.id,
            "name": project.name,
            "color": project.color,
            "task_count": project.task_count,
            "completed_task_count": project.completed_task_count,
            "completion_percentage": (
                round(project.completed_task_count / project.task_count * 100)
                if project.task_count
                else 0
            ),
        }
        for project in project_rows
    ]

    week_start = today - timedelta(days=6)
    created_by_day = {
        row["day"]: row["count"]
        for row in tasks.filter(created_at__date__gte=week_start)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
    }
    completed_by_day = {
        row["day"]: row["count"]
        for row in tasks.filter(
            completed_at__date__gte=week_start,
            status=Task.Status.DONE,
        )
        .annotate(day=TruncDate("completed_at"))
        .values("day")
        .annotate(count=Count("id"))
    }

    weekly_activity = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        weekly_activity.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%a"),
                "created": created_by_day.get(day, 0),
                "completed": completed_by_day.get(day, 0),
            }
        )

    recent_tasks = list(
        tasks.select_related("project").order_by("-updated_at")[:5]
    )
    upcoming_tasks = list(
        tasks.select_related("project")
        .filter(
            due_date__gte=today,
            due_date__lte=today + timedelta(days=7),
        )
        .exclude(status=Task.Status.DONE)
        .order_by("due_date", "-priority")
        .select_related("project")[:5]
    )
    serializer_context = {"request": request}

    return {
        "stats": {
            "total_tasks": total,
            "todo_tasks": counts["todo"],
            "in_progress_tasks": counts["in_progress"],
            "completed_tasks": counts["completed"],
            "overdue_tasks": counts["overdue"],
            "completion_percentage": completion,
            "total_projects": project_total,
            "active_projects": active_projects.count(),
        },
        "status_breakdown": [
            {"key": "todo", "label": "To Do", "count": counts["todo"]},
            {
                "key": "in_progress",
                "label": "In Progress",
                "count": counts["in_progress"],
            },
            {"key": "done", "label": "Done", "count": counts["completed"]},
        ],
        "priority_breakdown": [
            {"key": "low", "label": "Low", "count": counts["low"]},
            {"key": "medium", "label": "Medium", "count": counts["medium"]},
            {"key": "high", "label": "High", "count": counts["high"]},
            {"key": "urgent", "label": "Urgent", "count": counts["urgent"]},
        ],
        "weekly_activity": weekly_activity,
        "recent_tasks": TaskSerializer(
            recent_tasks,
            many=True,
            context=serializer_context,
        ).data,
        "upcoming_tasks": TaskSerializer(
            upcoming_tasks,
            many=True,
            context=serializer_context,
        ).data,
        "projects": project_data,
    }
