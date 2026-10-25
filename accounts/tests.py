from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class AuthViewTests(TestCase):
    def test_login_page_renders(self):
        response = self.client.get(reverse("login"))
        self.assertEqual(response.status_code, 200)

    def test_register_creates_user(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "testuser",
                "email": "test@example.com",
                "password1": "StrongPass!2345",
                "password2": "StrongPass!2345",
            },
        )
        self.assertRedirects(response, reverse("home"))
        self.assertTrue(User.objects.filter(username="testuser").exists())
        self.assertIn("_auth_user_id", self.client.session)

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(
            username="testuser",
            password="StrongPass!2345",
        )
        response = self.client.post(
            reverse("register"),
            {
                "username": "testuser",
                "email": "test2@example.com",
                "password1": "StrongPass!2345",
                "password2": "StrongPass!2345",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.filter(username="testuser").count(), 1)

    def test_logout_requires_post_and_redirects(self):
        user = User.objects.create_user(
            username="testuser",
            password="StrongPass!2345",
        )
        self.client.force_login(user)
        response = self.client.post(reverse("logout"))
        self.assertRedirects(response, reverse("home"))
        self.assertNotIn("_auth_user_id", self.client.session)
