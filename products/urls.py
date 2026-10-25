from django.urls import path

from .views import (
    add_to_cart,
    cart,
    checkout,
    decrease_cart,
    order_success,
    product_detail,
    product_list,
    remove_from_cart,
)

urlpatterns = [
    path("", product_list, name="product_list"),
    path("cart/", cart, name="cart"),
    path("checkout/", checkout, name="checkout"),
    path(
        "order/<uuid:order_uuid>/",
        order_success,
        name="order_success",
    ),
    path("add-to-cart/<int:product_id>/", add_to_cart, name="add_to_cart"),
    path(
        "decrease-cart/<int:product_id>/",
        decrease_cart,
        name="decrease_cart",
    ),
    path(
        "remove-from-cart/<int:product_id>/",
        remove_from_cart,
        name="remove_from_cart",
    ),
    path("<slug:slug>/", product_detail, name="product_detail"),
]
