import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return f"{reverse('product_list')}?category={self.slug}"


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=900)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(discount_price__isnull=True)
                    | Q(discount_price__lt=F("price"))
                ),
                name="discount_price_less_than_price",
                violation_error_message=(
                    "Chegirma narxi asosiy narxdan kichik bo'lishi kerak."
                ),
            ),
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("product_detail", args=[self.slug])

    def clean(self):
        super().clean()
        if (
            self.discount_price is not None
            and self.price is not None
            and self.discount_price >= self.price
        ):
            raise ValidationError(
                {
                    "discount_price": (
                        "Chegirma narxi asosiy narxdan kichik bo'lishi kerak."
                    )
                }
            )

    @property
    def final_price(self):
        """Return the price the customer actually pays."""
        if self.discount_price is not None:
            return self.discount_price
        return self.price

    @property
    def has_discount(self):
        return self.discount_price is not None

    @property
    def discount_percent(self):
        if not self.has_discount or not self.price:
            return 0
        discount = self.price - self.discount_price
        return int((discount / self.price) * Decimal("100"))

    @property
    def is_in_stock(self):
        return self.stock > 0


class Order(models.Model):
    STATUS_NEW = "new"
    STATUS_PROCESSING = "processing"
    STATUS_SHIPPED = "shipped"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_NEW, "Yangi"),
        (STATUS_PROCESSING, "Tayyorlanmoqda"),
        (STATUS_SHIPPED, "Yo'lda"),
        (STATUS_COMPLETED, "Yetkazildi"),
        (STATUS_CANCELLED, "Bekor qilindi"),
    ]

    PAYMENT_CASH = "cash"
    PAYMENT_CARD = "card"
    PAYMENT_BANK = "bank"
    PAYMENT_CHOICES = [
        (PAYMENT_CASH, "Yetkazib berishda naqd pul"),
        (PAYMENT_CARD, "Yetkazib berishda karta"),
        (PAYMENT_BANK, "Bank o'tkazmasi"),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders",
        null=True,
        blank=True,
    )
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default=PAYMENT_CASH,
    )
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Buyurtma {self.short_id}"

    @property
    def short_id(self):
        return str(self.uuid).split("-")[0].upper()


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        related_name="order_items",
        null=True,
        blank=True,
    )
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    @property
    def total_price(self):
        return self.price * self.quantity
