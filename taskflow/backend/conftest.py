from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from projects.models import Project
from tasks.models import Task

User = get_user_model()

PASSWORD = "StrongPass!2026"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password=PASSWORD,
        first_name="Alice",
        last_name="Nguyen",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="bob",
        email="bob@example.com",
        password=PASSWORD,
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_login(user)
    return api_client


@pytest.fixture
def other_client(api_client, other_user):
    client = APIClient()
    client.force_login(other_user)
    return client


@pytest.fixture
def project(user):
    return Project.objects.create(
        owner=user,
        name="Website refresh",
        description="Improve the marketing site.",
        color="#6366f1",
    )


@pytest.fixture
def other_project(other_user):
    return Project.objects.create(
        owner=other_user,
        name="Private project",
        color="#0ea5e9",
    )


@pytest.fixture
def task(user, project):
    return Task.objects.create(
        owner=user,
        project=project,
        title="Finalize homepage copy",
        description="Tighten the headline.",
        priority=Task.Priority.HIGH,
        due_date=timezone.localdate() + timedelta(days=2),
    )
