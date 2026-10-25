from datetime import timedelta
from io import StringIO

import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.utils import timezone

from projects.models import Project
from tasks.models import Task

pytestmark = pytest.mark.django_db

TASKS_URL = "/api/v1/tasks/"


def test_create_task_assigns_owner_and_defaults(auth_client, user, project):
    response = auth_client.post(
        TASKS_URL,
        {
            "title": "  Write launch notes  ",
            "description": "Customer-facing summary.",
            "project": project.id,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Write launch notes"
    assert body["status"] == "todo"
    assert body["priority"] == "medium"
    assert body["is_completed"] is False
    task = Task.objects.get(pk=body["id"])
    assert task.owner == user
    assert task.project == project


def test_create_task_rejects_other_users_project(
    auth_client, other_project
):
    response = auth_client.post(
        TASKS_URL,
        {"title": "Should fail", "project": other_project.id},
    )
    assert response.status_code == 400
    assert "project" in response.json()
    assert not Task.objects.filter(title="Should fail").exists()


def test_create_task_requires_title_and_project(auth_client):
    response = auth_client.post(TASKS_URL, {"title": " ", "project": ""})
    assert response.status_code == 400
    assert "title" in response.json()
    assert "project" in response.json()


def test_create_task_validates_due_date(auth_client, project):
    response = auth_client.post(
        TASKS_URL,
        {
            "title": "Bad date",
            "project": project.id,
            "due_date": "not-a-date",
        },
    )
    assert response.status_code == 400
    assert "due_date" in response.json()


def test_task_list_only_contains_owned_tasks(
    auth_client, task, other_user, other_project
):
    other_task = Task.objects.create(
        owner=other_user,
        project=other_project,
        title="Private task",
    )
    response = auth_client.get(TASKS_URL)
    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["results"]]
    assert task.id in ids
    assert other_task.id not in ids


def test_other_users_task_cannot_be_read_updated_or_deleted(
    auth_client, other_user, other_project
):
    other_task = Task.objects.create(
        owner=other_user,
        project=other_project,
        title="Private task",
    )
    url = f"{TASKS_URL}{other_task.id}/"
    assert auth_client.get(url).status_code == 404
    assert auth_client.patch(url, {"title": "Hijacked"}).status_code == 404
    assert auth_client.delete(url).status_code == 404
    other_task.refresh_from_db()
    assert other_task.title == "Private task"


def test_marking_done_sets_completed_at_and_reopening_clears_it(
    auth_client, task
):
    done = auth_client.patch(
        f"{TASKS_URL}{task.id}/",
        {"status": "done"},
    )
    assert done.status_code == 200
    body = done.json()
    assert body["is_completed"] is True
    assert body["completed_at"] is not None

    task.refresh_from_db()
    assert task.completed_at is not None

    reopened = auth_client.patch(
        f"{TASKS_URL}{task.id}/",
        {"status": "todo"},
    )
    assert reopened.status_code == 200
    assert reopened.json()["completed_at"] is None
    task.refresh_from_db()
    assert task.completed_at is None


def test_combined_filters(auth_client, user, project):
    Task.objects.create(
        owner=user,
        project=project,
        title="Draft homepage copy",
        status=Task.Status.TODO,
        priority=Task.Priority.HIGH,
    )
    Task.objects.create(
        owner=user,
        project=project,
        title="Draft launch email",
        status=Task.Status.TODO,
        priority=Task.Priority.LOW,
    )
    Task.objects.create(
        owner=user,
        project=project,
        title="QA homepage",
        status=Task.Status.DONE,
        priority=Task.Priority.HIGH,
    )
    response = auth_client.get(
        TASKS_URL,
        {
            "project": project.id,
            "status": "todo",
            "priority": "high",
            "search": "homepage",
        },
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert [item["title"] for item in results] == ["Draft homepage copy"]


def test_overdue_and_upcoming_filters(auth_client, user, project):
    today = timezone.localdate()
    overdue = Task.objects.create(
        owner=user,
        project=project,
        title="Overdue task",
        due_date=today - timedelta(days=2),
    )
    upcoming = Task.objects.create(
        owner=user,
        project=project,
        title="Upcoming task",
        due_date=today + timedelta(days=2),
    )
    done = Task.objects.create(
        owner=user,
        project=project,
        title="Done past task",
        status=Task.Status.DONE,
        due_date=today - timedelta(days=1),
    )

    overdue_response = auth_client.get(TASKS_URL, {"due": "overdue"})
    ids = [item["id"] for item in overdue_response.json()["results"]]
    assert overdue.id in ids
    assert done.id not in ids

    upcoming_response = auth_client.get(TASKS_URL, {"due": "upcoming"})
    ids = [item["id"] for item in upcoming_response.json()["results"]]
    assert upcoming.id in ids
    assert overdue.id not in ids


def test_priority_ordering_uses_semantic_rank(auth_client, user, project):
    low = Task.objects.create(
        owner=user,
        project=project,
        title="Low",
        priority=Task.Priority.LOW,
    )
    urgent = Task.objects.create(
        owner=user,
        project=project,
        title="Urgent",
        priority=Task.Priority.URGENT,
    )
    medium = Task.objects.create(
        owner=user,
        project=project,
        title="Medium",
        priority=Task.Priority.MEDIUM,
    )
    response = auth_client.get(TASKS_URL, {"ordering": "priority"})
    ids = [item["id"] for item in response.json()["results"]]
    assert ids == [urgent.id, medium.id, low.id]


def test_task_pagination(auth_client, user, project):
    Task.objects.bulk_create(
        [
            Task(owner=user, project=project, title=f"Task {index}")
            for index in range(5)
        ]
    )
    response = auth_client.get(TASKS_URL, {"page_size": 2})
    body = response.json()
    assert body["count"] == 5
    assert len(body["results"]) == 2
    assert body["next"] is not None


def test_invalid_task_query_parameters_are_rejected(auth_client):
    assert auth_client.get(TASKS_URL, {"status": "blocked"}).status_code == 400
    assert auth_client.get(TASKS_URL, {"ordering": "owner"}).status_code == 400
    assert auth_client.get(TASKS_URL, {"due": "someday"}).status_code == 400


def test_project_filter_rejects_another_users_project(
    auth_client, other_project
):
    response = auth_client.get(TASKS_URL, {"project": other_project.id})
    assert response.status_code == 400
    assert "project" in response.json()


def test_task_model_rejects_project_from_other_owner(other_user, project):
    task = Task(owner=other_user, project=project, title="Bad ownership")
    with pytest.raises(ValidationError) as exc_info:
        task.full_clean()
    assert "project" in exc_info.value.message_dict


def test_is_overdue_property(task):
    assert task.is_overdue is False
    task.due_date = timezone.localdate() - timedelta(days=1)
    task.save()
    assert task.is_overdue is True
    task.status = Task.Status.DONE
    task.save()
    assert task.is_overdue is False


def test_seed_demo_is_idempotent(user):
    output = StringIO()
    call_command("seed_demo", user=user.username, stdout=output)
    first_project_count = Project.objects.filter(owner=user).count()
    first_task_count = Task.objects.filter(owner=user).count()
    assert first_project_count == 4
    assert first_task_count == 16
    assert Task.objects.filter(owner=user, completed_at__isnull=False).exists()

    call_command("seed_demo", user=user.username, stdout=output)
    assert Project.objects.filter(owner=user).count() == first_project_count
    assert Task.objects.filter(owner=user).count() == first_task_count
