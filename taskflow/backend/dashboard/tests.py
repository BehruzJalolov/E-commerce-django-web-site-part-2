from datetime import timedelta

import pytest
from django.utils import timezone

from projects.models import Project
from tasks.models import Task

pytestmark = pytest.mark.django_db

DASHBOARD_URL = "/api/v1/dashboard/"


def test_dashboard_requires_authentication(api_client):
    assert api_client.get(DASHBOARD_URL).status_code == 401


def test_empty_dashboard_has_real_zero_state(auth_client):
    response = auth_client.get(DASHBOARD_URL)
    assert response.status_code == 200
    body = response.json()
    assert body["stats"]["total_tasks"] == 0
    assert body["stats"]["completion_percentage"] == 0
    assert body["status_breakdown"] == [
        {"key": "todo", "label": "To Do", "count": 0},
        {"key": "in_progress", "label": "In Progress", "count": 0},
        {"key": "done", "label": "Done", "count": 0},
    ]
    assert len(body["weekly_activity"]) == 7
    assert body["recent_tasks"] == []
    assert body["upcoming_tasks"] == []
    assert body["projects"] == []


def test_dashboard_counts_and_completion(auth_client, user, project):
    today = timezone.localdate()
    Task.objects.create(owner=user, project=project, title="Todo")
    Task.objects.create(
        owner=user,
        project=project,
        title="Doing",
        status=Task.Status.IN_PROGRESS,
    )
    Task.objects.create(
        owner=user,
        project=project,
        title="Done",
        status=Task.Status.DONE,
    )
    Task.objects.create(
        owner=user,
        project=project,
        title="Overdue",
        due_date=today - timedelta(days=2),
    )
    Task.objects.create(
        owner=user,
        project=project,
        title="Done and past due",
        status=Task.Status.DONE,
        due_date=today - timedelta(days=3),
    )

    response = auth_client.get(DASHBOARD_URL)
    assert response.status_code == 200
    stats = response.json()["stats"]
    assert stats["total_tasks"] == 5
    assert stats["todo_tasks"] == 2
    assert stats["in_progress_tasks"] == 1
    assert stats["completed_tasks"] == 2
    assert stats["overdue_tasks"] == 1
    assert stats["completion_percentage"] == 40
    assert stats["total_projects"] == 1
    assert stats["active_projects"] == 1


def test_dashboard_excludes_other_users_data(
    auth_client, user, other_user, other_project
):
    Task.objects.create(
        owner=other_user,
        project=other_project,
        title="Secret task",
    )
    body = auth_client.get(DASHBOARD_URL).json()
    assert body["stats"]["total_tasks"] == 0
    assert body["recent_tasks"] == []
    assert body["projects"] == []


def test_dashboard_recent_and_upcoming_are_real_and_ordered(
    auth_client, user, project
):
    today = timezone.localdate()
    upcoming_soon = Task.objects.create(
        owner=user,
        project=project,
        title="Soon",
        due_date=today + timedelta(days=1),
    )
    upcoming_later = Task.objects.create(
        owner=user,
        project=project,
        title="Later",
        due_date=today + timedelta(days=5),
    )
    finished = Task.objects.create(
        owner=user,
        project=project,
        title="Finished",
        status=Task.Status.DONE,
        due_date=today + timedelta(days=2),
    )
    body = auth_client.get(DASHBOARD_URL).json()
    upcoming_titles = [item["title"] for item in body["upcoming_tasks"]]
    assert upcoming_titles == ["Soon", "Later"]
    assert finished.title not in upcoming_titles
    assert upcoming_soon.id in [
        item["id"] for item in body["recent_tasks"]
    ]
    assert upcoming_later.id in [
        item["id"] for item in body["recent_tasks"]
    ]


def test_project_overview_only_lists_active_projects_with_progress(
    auth_client, user, project
):
    archived = Project.objects.create(
        owner=user,
        name="Archived",
        is_archived=True,
    )
    Task.objects.create(owner=user, project=project, title="One")
    Task.objects.create(
        owner=user,
        project=project,
        title="Two",
        status=Task.Status.DONE,
    )
    Task.objects.create(owner=user, project=archived, title="Hidden")

    body = auth_client.get(DASHBOARD_URL).json()
    overview = body["projects"]
    assert len(overview) == 1
    assert overview[0]["id"] == project.id
    assert overview[0]["task_count"] == 2
    assert overview[0]["completed_task_count"] == 1
    assert overview[0]["completion_percentage"] == 50
    assert body["stats"]["total_projects"] == 2
    assert body["stats"]["active_projects"] == 1


def test_weekly_activity_uses_created_and_completed_days(
    auth_client, user, project
):
    task = Task.objects.create(
        owner=user,
        project=project,
        title="Activity",
        status=Task.Status.DONE,
    )
    today = timezone.localdate()
    Task.objects.filter(pk=task.pk).update(
        created_at=timezone.now() - timedelta(days=2),
        completed_at=timezone.now(),
    )
    body = auth_client.get(DASHBOARD_URL).json()
    activity = {row["date"]: row for row in body["weekly_activity"]}
    created_day = (today - timedelta(days=2)).isoformat()
    assert activity[created_day]["created"] == 1
    assert activity[today.isoformat()]["completed"] == 1


def test_health_and_schema_endpoints_are_available(api_client):
    health = api_client.get("/api/v1/health/")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    schema = api_client.get("/api/schema/")
    assert schema.status_code == 200
    assert b"openapi" in schema.content.lower()
