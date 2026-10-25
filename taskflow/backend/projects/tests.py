import pytest

from tasks.models import Task

pytestmark = pytest.mark.django_db

PROJECTS_URL = "/api/v1/projects/"


def test_create_project_assigns_owner(auth_client, user):
    response = auth_client.post(
        PROJECTS_URL,
        {
            "name": "Mobile app",
            "description": "Plan v2.",
            "color": "#0EA5E9",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["task_count"] == 0
    assert body["completion_percentage"] == 0
    from projects.models import Project

    project = Project.objects.get(pk=body["id"])
    assert project.owner == user
    assert project.color == "#0ea5e9"


def test_list_only_returns_owned_projects(auth_client, project, other_project):
    response = auth_client.get(PROJECTS_URL)
    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["results"]]
    assert ids == [project.id]
    assert other_project.id not in ids


def test_other_users_project_is_not_retrievable(auth_client, other_project):
    response = auth_client.get(f"{PROJECTS_URL}{other_project.id}/")
    assert response.status_code == 404


def test_other_users_project_cannot_be_updated_or_deleted(
    auth_client, other_project
):
    update = auth_client.patch(
        f"{PROJECTS_URL}{other_project.id}/",
        {"name": "Hijacked"},
    )
    assert update.status_code == 404
    delete = auth_client.delete(f"{PROJECTS_URL}{other_project.id}/")
    assert delete.status_code == 404
    other_project.refresh_from_db()
    assert other_project.name == "Private project"


def test_update_and_archive_project(auth_client, project):
    response = auth_client.patch(
        f"{PROJECTS_URL}{project.id}/",
        {"name": "Website v2", "is_archived": True},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Website v2"
    assert response.json()["is_archived"] is True

    active = auth_client.get(PROJECTS_URL)
    assert active.json()["count"] == 0
    archived = auth_client.get(PROJECTS_URL, {"archived": "archived"})
    assert archived.json()["count"] == 1

    detail = auth_client.get(f"{PROJECTS_URL}{project.id}/")
    assert detail.status_code == 200
    assert detail.json()["is_archived"] is True

    restored = auth_client.patch(
        f"{PROJECTS_URL}{project.id}/",
        {"is_archived": False},
    )
    assert restored.status_code == 200
    assert restored.json()["is_archived"] is False
    assert auth_client.get(PROJECTS_URL).json()["count"] == 1


def test_delete_project_cascades_tasks(auth_client, project, task):
    response = auth_client.delete(f"{PROJECTS_URL}{project.id}/")
    assert response.status_code == 204
    assert not Task.objects.filter(pk=task.pk).exists()


def test_duplicate_project_name_is_rejected_case_insensitively(
    auth_client, project
):
    response = auth_client.post(
        PROJECTS_URL,
        {"name": "WEBSITE REFRESH"},
    )
    assert response.status_code == 400
    assert "name" in response.json()


def test_same_project_name_is_allowed_for_different_owners(
    other_client, other_user
):
    response = other_client.post(PROJECTS_URL, {"name": "Website refresh"})
    assert response.status_code == 201
    assert response.json()["name"] == "Website refresh"


def test_project_search_and_ordering(auth_client, user):
    from projects.models import Project

    Project.objects.create(owner=user, name="Alpha")
    Project.objects.create(owner=user, name="Beta", description="Launch plan")
    response = auth_client.get(
        PROJECTS_URL,
        {"search": "launch", "ordering": "name"},
    )
    assert response.status_code == 200
    names = [item["name"] for item in response.json()["results"]]
    assert names == ["Beta"]


def test_project_pagination(auth_client, user):
    from projects.models import Project

    Project.objects.bulk_create(
        [Project(owner=user, name=f"Project {i}") for i in range(3)]
    )
    response = auth_client.get(PROJECTS_URL, {"page_size": 2})
    body = response.json()
    assert body["count"] == 3
    assert len(body["results"]) == 2
    assert body["next"] is not None


def test_project_query_parameters_are_validated(auth_client):
    invalid_archived = auth_client.get(PROJECTS_URL, {"archived": "nonsense"})
    assert invalid_archived.status_code == 400
    invalid_order = auth_client.get(PROJECTS_URL, {"ordering": "created_by"})
    assert invalid_order.status_code == 400


def test_project_counts_and_completion(auth_client, user, project, task):
    from tasks.models import Task

    Task.objects.create(
        owner=user,
        project=project,
        title="Done task",
        status=Task.Status.DONE,
    )
    response = auth_client.get(f"{PROJECTS_URL}{project.id}/")
    body = response.json()
    assert body["task_count"] == 2
    assert body["completed_task_count"] == 1
    assert body["open_task_count"] == 1
    assert body["completion_percentage"] == 50
