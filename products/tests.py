from decimal import Decimal
from io import StringIO

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse

from blog.models import Post

from .models import Category, Order, OrderItem, Product


class ProductModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Elektronika",
            slug="elektronika",
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Telefon",
            slug="telefon",
            description="Yaxshi telefon",
            price=Decimal("50000.00"),
            stock=5,
        )

    def test_final_price_without_discount(self):
        self.assertEqual(self.product.final_price, Decimal("50000.00"))
        self.assertFalse(self.product.has_discount)

    def test_final_price_with_discount(self):
        self.product.discount_price = Decimal("40000.00")
        self.product.save()
        self.assertEqual(self.product.final_price, Decimal("40000.00"))
        self.assertTrue(self.product.has_discount)
        self.assertEqual(self.product.discount_percent, 20)

    def test_discount_must_be_lower_than_price(self):
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                category=self.category,
                name="Noto'g'ri narx",
                slug="notogri-narx",
                description="Test",
                price=Decimal("100.00"),
                discount_price=Decimal("120.00"),
                stock=1,
            )

    def test_clean_rejects_invalid_discount(self):
        self.product.discount_price = Decimal("60000.00")
        with self.assertRaises(ValidationError):
            self.product.full_clean()

    def test_order_item_total_price(self):
        order = Order.objects.create(
            full_name="Test",
            email="test@example.com",
            phone="+998901234567",
            address="Toshkent",
            total=Decimal("100000.00"),
        )
        item = OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            price=Decimal("50000.00"),
            quantity=2,
        )
        self.assertEqual(item.total_price, Decimal("100000.00"))


class CartViewTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Elektronika",
            slug="elektronika",
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Telefon",
            slug="telefon",
            description="Yaxshi telefon",
            price=Decimal("50000.00"),
            stock=5,
        )

    def test_empty_cart_renders(self):
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Savatingiz hozircha bo'sh")

    def test_add_to_cart_get_is_not_allowed(self):
        response = self.client.get(
            reverse("add_to_cart", args=[self.product.id])
        )
        self.assertEqual(response.status_code, 405)

    def test_add_to_cart_post(self):
        response = self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 2},
        )
        self.assertRedirects(response, reverse("cart"))
        self.assertEqual(
            self.client.session["cart"],
            {str(self.product.id): 2},
        )

    def test_quantity_is_capped_at_stock(self):
        self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 99},
        )
        self.assertEqual(
            self.client.session["cart"][str(self.product.id)],
            5,
        )

    def test_add_missing_product_returns_404(self):
        response = self.client.post(
            reverse("add_to_cart", args=[999999]),
            {"quantity": 1},
        )
        self.assertEqual(response.status_code, 404)

    def test_decrease_and_remove(self):
        self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 2},
        )
        self.client.post(
            reverse("decrease_cart", args=[self.product.id])
        )
        self.assertEqual(
            self.client.session["cart"][str(self.product.id)],
            1,
        )
        self.client.post(
            reverse("decrease_cart", args=[self.product.id])
        )
        self.assertNotIn(str(self.product.id), self.client.session["cart"])

        self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 1},
        )
        self.client.post(
            reverse("remove_from_cart", args=[self.product.id])
        )
        self.assertNotIn(str(self.product.id), self.client.session["cart"])

    def test_deleted_product_is_removed_from_cart(self):
        self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 1},
        )
        self.product.delete()
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.session["cart"], {})


class CheckoutTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Elektronika",
            slug="elektronika",
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Telefon",
            slug="telefon",
            description="Yaxshi telefon",
            price=Decimal("50000.00"),
            discount_price=Decimal("40000.00"),
            stock=5,
        )
        self.client.post(
            reverse("add_to_cart", args=[self.product.id]),
            {"quantity": 2},
        )

    def _checkout_data(self, **overrides):
        data = {
            "full_name": "Test Foydalanuvchi",
            "email": "test@example.com",
            "phone": "+998901234567",
            "address": "Toshkent, Test ko'chasi 1",
            "city": "Toshkent",
            "note": "",
            "payment_method": "cash",
        }
        data.update(overrides)
        return data

    def test_checkout_page_renders(self):
        response = self.client.get(reverse("checkout"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Telefon")

    def test_checkout_creates_order_and_reduces_stock(self):
        response = self.client.post(
            reverse("checkout"),
            self._checkout_data(),
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)

        order = Order.objects.get()
        self.assertEqual(order.total, Decimal("95000.00"))
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().price, Decimal("40000.00"))
        self.assertEqual(order.items.first().quantity, 2)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(self.client.session["cart"], {})

        success_response = self.client.get(response.url)
        self.assertEqual(success_response.status_code, 200)
        self.assertContains(success_response, order.short_id)

    def test_checkout_rejects_insufficient_stock(self):
        self.product.stock = 1
        self.product.save(update_fields=["stock"])

        response = self.client.post(
            reverse("checkout"),
            self._checkout_data(),
        )
        self.assertRedirects(response, reverse("cart"))
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_checkout_with_empty_cart_redirects(self):
        self.client.post(reverse("remove_from_cart", args=[self.product.id]))
        response = self.client.get(reverse("checkout"))
        self.assertRedirects(response, reverse("cart"))

    def test_invalid_checkout_form_does_not_create_order(self):
        response = self.client.post(
            reverse("checkout"),
            self._checkout_data(email="bad-email", full_name=""),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.count(), 0)
        self.assertContains(response, "Ism va familiya")


class ProductPageTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Elektronika",
            slug="elektronika",
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Samsung A55",
            slug="samsung-a55",
            description="Telefon",
            price=Decimal("50000.00"),
            stock=3,
        )

    def test_product_list_renders(self):
        response = self.client.get(reverse("product_list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Samsung A55")

    def test_product_filter_by_query(self):
        response = self.client.get(reverse("product_list"), {"q": "samsung"})
        self.assertContains(response, "Samsung A55")

    def test_product_detail_renders(self):
        response = self.client.get(
            reverse("product_detail", args=[self.product.slug])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Samsung A55")

    def test_in_stock_filter(self):
        Product.objects.create(
            category=self.category,
            name="Tugagan mahsulot",
            slug="tugagan-mahsulot",
            description="Omborda yo'q",
            price=Decimal("10000.00"),
            stock=0,
        )
        response = self.client.get(
            reverse("product_list"),
            {"in_stock": "1"},
        )
        self.assertContains(response, "Samsung A55")
        self.assertNotContains(response, "Tugagan mahsulot")

    def test_on_sale_filter(self):
        Product.objects.create(
            category=self.category,
            name="Chegirmadagi mahsulot",
            slug="chegirmadagi-mahsulot",
            description="Chegirma bor",
            price=Decimal("10000.00"),
            discount_price=Decimal("8000.00"),
            stock=2,
        )
        response = self.client.get(
            reverse("product_list"),
            {"on_sale": "1"},
        )
        self.assertContains(response, "Chegirmadagi mahsulot")
        self.assertNotContains(response, "Samsung A55")

    def test_pagination_works(self):
        for index in range(13):
            Product.objects.create(
                category=self.category,
                name=f"Mahsulot {index}",
                slug=f"mahsulot-{index}",
                description="Test mahsulot",
                price=Decimal("10000.00"),
                stock=1,
            )

        response = self.client.get(reverse("product_list"), {"page": 2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["page_obj"].number, 2)
        self.assertTrue(response.context["page_obj"].has_previous())
        self.assertContains(response, "?page=1")


class AdminSmokeTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="StrongPass!2345",
        )

    def test_product_changelist(self):
        self.client.force_login(self.admin_user)
        response = self.client.get(
            reverse("admin:products_product_changelist")
        )
        self.assertEqual(response.status_code, 200)

    def test_order_changelist(self):
        self.client.force_login(self.admin_user)
        response = self.client.get(
            reverse("admin:products_order_changelist")
        )
        self.assertEqual(response.status_code, 200)

    def test_obvious_admin_url_is_not_exposed(self):
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 404)

    def test_anonymous_user_is_redirected_to_secret_admin_login(self):
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 302)
        self.assertIn(f"/{settings.ADMIN_URL}", response.url)
        self.assertNotIn("/admin/", response.url)

    def test_staff_user_without_superuser_is_blocked(self):
        staff = get_user_model().objects.create_user(
            username="staff",
            email="staff@example.com",
            password="StrongPass!2345",
            is_staff=True,
        )
        self.client.force_login(staff)
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 403)


class SeedDemoTests(TestCase):
    def test_seed_is_idempotent_and_creates_catalog(self):
        output = StringIO()
        call_command("seed_demo", skip_images=True, stdout=output)
        first_product_count = Product.objects.count()
        first_post_count = Post.objects.count()
        first_category_count = Category.objects.count()

        self.assertGreaterEqual(first_product_count, 20)
        self.assertGreaterEqual(first_post_count, 8)
        self.assertGreaterEqual(first_category_count, 10)

        call_command("seed_demo", skip_images=True, stdout=output)

        self.assertEqual(Product.objects.count(), first_product_count)
        self.assertEqual(Post.objects.count(), first_post_count)
        self.assertEqual(Category.objects.count(), first_category_count)
