from django.conf import settings
from django.db.models import Count

from .models import Category

CATEGORY_IMAGES = {
    "electronics": "img/category-phone.jpg",
    "iphone": "img/category-phone.jpg",
    "kiyim-kechak": "img/carousel-1.jpg",
    "poyabzal": "img/product-4.jpg",
    "uy-rozgor": "img/category-sofa.jpg",
    "gozallik": "img/cat-4.jpg",
    "sport": "img/category-sport.jpg",
    "kitoblar": "img/category-books.jpg",
    "oyinchoqlar": "img/carousel-3.jpg",
    "avtomobil": "img/category-auto.jpg",
    "oziq-ovqat": "img/category-food.jpg",
}


def shop_context(request):
    """Shared data for the navbar, category menu and cart badge."""
    categories = Category.objects.annotate(product_count=Count("products"))
    for category in categories:
        category.card_image = CATEGORY_IMAGES.get(
            category.slug,
            "img/product-placeholder.svg",
        )

    cart = request.session.get("cart", {})
    if not isinstance(cart, dict):
        cart = {}

    cart_item_count = 0
    for quantity in cart.values():
        try:
            cart_item_count += int(quantity)
        except (TypeError, ValueError):
            continue

    return {
        "categories": categories,
        "cart_item_count": cart_item_count,
        "contact_email": settings.CONTACT_EMAIL,
    }
