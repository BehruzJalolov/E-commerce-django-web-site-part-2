from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import ContactMessage, Post


class BlogViewTests(TestCase):
    def setUp(self):
        self.post = Post.objects.create(
            title="Birinchi maqola",
            content="Bu juda foydali maqola. " * 20,
        )

    def test_home_page_renders(self):
        response = self.client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)

    def test_post_list_renders(self):
        response = self.client.get(reverse("post_list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.post.title)

    def test_post_detail_renders(self):
        response = self.client.get(self.post.get_absolute_url())
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.post.title)

    def test_excerpt_is_shortened(self):
        self.assertLessEqual(len(self.post.excerpt), 183)
        self.assertTrue(self.post.excerpt.endswith("..."))


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class ContactViewTests(TestCase):
    def test_contact_page_renders(self):
        response = self.client.get(reverse("contact"))
        self.assertEqual(response.status_code, 200)

    def test_contact_form_sends_email(self):
        response = self.client.post(
            reverse("contact"),
            {
                "name": "Test",
                "email": "test@example.com",
                "subject": "Savol",
                "message": "Salom, savolim bor.",
            },
        )
        self.assertRedirects(response, reverse("contact"))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Savol")
        self.assertEqual(mail.outbox[0].reply_to, ["test@example.com"])

        saved = ContactMessage.objects.get()
        self.assertEqual(saved.name, "Test")
        self.assertEqual(saved.email, "test@example.com")
        self.assertFalse(saved.is_read)

    def test_invalid_contact_form_does_not_save_or_send(self):
        response = self.client.post(
            reverse("contact"),
            {
                "name": "",
                "email": "bad-email",
                "subject": "",
                "message": "",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ContactMessage.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)
