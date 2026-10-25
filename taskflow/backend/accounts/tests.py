import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from conftest import PASSWORD

User = get_user_model()

pytestmark = pytest.mark.django_db

REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"
ME_URL = "/api/v1/auth/me/"
PROFILE_URL = "/api/v1/auth/profile/"
PASSWORD_URL = "/api/v1/auth/password/change/"
CSRF_URL = "/api/v1/auth/csrf/"


def test_register_creates_hashed_user_and_session(api_client):
    response = api_client.post(
        REGISTER_URL,
        {
            "username": "carol",
            "email": "Carol@Example.com",
            "password": PASSWORD,
            "password_confirm": PASSWORD,
        },
    )
    assert response.status_code == 201
    assert "password" not in response.json()["user"]
    saved = User.objects.get(username="carol")
    assert saved.email == "carol@example.com"
    assert saved.check_password(PASSWORD)
    me = api_client.get(ME_URL)
    assert me.status_code == 200
    assert me.json()["username"] == "carol"


def test_register_rejects_duplicate_username_case_insensitively(api_client, user):
    response = api_client.post(
        REGISTER_URL,
        {
            "username": "ALICE",
            "email": "new@example.com",
            "password": PASSWORD,
            "password_confirm": PASSWORD,
        },
    )
    assert response.status_code == 400
    assert "username" in response.json()


def test_register_rejects_duplicate_email_case_insensitively(api_client, user):
    response = api_client.post(
        REGISTER_URL,
        {
            "username": "new-user",
            "email": "ALICE@example.com",
            "password": PASSWORD,
            "password_confirm": PASSWORD,
        },
    )
    assert response.status_code == 400
    assert "email" in response.json()


def test_register_rejects_mismatched_passwords(api_client):
    response = api_client.post(
        REGISTER_URL,
        {
            "username": "carol",
            "email": "carol@example.com",
            "password": PASSWORD,
            "password_confirm": "AnotherPass!2026",
        },
    )
    assert response.status_code == 400
    assert "password_confirm" in response.json()


def test_register_rejects_weak_password(api_client):
    response = api_client.post(
        REGISTER_URL,
        {
            "username": "carol",
            "email": "carol@example.com",
            "password": "short",
            "password_confirm": "short",
        },
    )
    assert response.status_code == 400
    assert not User.objects.filter(username="carol").exists()


def test_login_with_username(api_client, user):
    response = api_client.post(
        LOGIN_URL,
        {"login": "alice", "password": PASSWORD},
    )
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "alice@example.com"
    assert api_client.get(ME_URL).status_code == 200


def test_login_with_email_is_case_insensitive(api_client, user):
    response = api_client.post(
        LOGIN_URL,
        {"login": "ALICE@example.com", "password": PASSWORD},
    )
    assert response.status_code == 200
    assert response.json()["user"]["username"] == "alice"


def test_login_failure_is_generic_and_does_not_create_session(api_client, user):
    response = api_client.post(
        LOGIN_URL,
        {"login": "alice", "password": "WrongPassword!2026"},
    )
    assert response.status_code == 401
    detail = response.json()["detail"].lower()
    assert "invalid" in detail
    assert "password" in detail
    assert "does not exist" not in detail
    assert api_client.get(ME_URL).status_code == 401


def test_anonymous_user_cannot_read_profile(api_client):
    assert api_client.get(ME_URL).status_code == 401
    assert api_client.get(PROFILE_URL).status_code == 401


def test_logout_clears_session(auth_client):
    assert auth_client.get(ME_URL).status_code == 200
    response = auth_client.post("/api/v1/auth/logout/")
    assert response.status_code == 200
    assert auth_client.get(ME_URL).status_code == 401


def test_profile_update_normalizes_email(auth_client, user):
    response = auth_client.patch(
        PROFILE_URL,
        {
            "first_name": "Alicia",
            "email": "ALICIA@Example.com",
        },
    )
    assert response.status_code == 200
    assert response.json()["first_name"] == "Alicia"
    user.refresh_from_db()
    assert user.email == "alicia@example.com"


def test_profile_rejects_email_owned_by_another_user(
    auth_client, other_user
):
    response = auth_client.patch(PROFILE_URL, {"email": other_user.email})
    assert response.status_code == 400
    assert "email" in response.json()


def test_password_change_requires_current_password(auth_client):
    response = auth_client.post(
        PASSWORD_URL,
        {
            "old_password": "WrongPassword!2026",
            "new_password": "NewStrongPass!2026",
            "new_password_confirm": "NewStrongPass!2026",
        },
    )
    assert response.status_code == 400
    assert "old_password" in response.json()


def test_password_change_updates_password_and_keeps_session(auth_client, user):
    response = auth_client.post(
        PASSWORD_URL,
        {
            "old_password": PASSWORD,
            "new_password": "NewStrongPass!2026",
            "new_password_confirm": "NewStrongPass!2026",
        },
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewStrongPass!2026")
    assert auth_client.get(ME_URL).status_code == 200


def test_login_requires_csrf_when_enforcement_is_enabled(user):
    client = APIClient(enforce_csrf_checks=True)
    blocked = client.post(
        LOGIN_URL,
        {"login": "alice", "password": PASSWORD},
    )
    assert blocked.status_code == 403

    csrf_response = client.get(CSRF_URL)
    assert csrf_response.status_code == 200
    token = client.cookies["csrftoken"].value
    allowed = client.post(
        LOGIN_URL,
        {"login": "alice", "password": PASSWORD},
        HTTP_X_CSRFTOKEN=token,
    )
    assert allowed.status_code == 200
