from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.contrib import messages
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST

from .forms import OrderForm
from .models import Order, OrderItem, Product

SORT_OPTIONS = {
    "newest": "-id",
    "oldest": "id",
    "price_asc": "effective_price",
    "price_desc": "-effective_price",
    "name": "name",
}


def _parse_decimal(value):
    try:
        parsed = Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        return None
    if not parsed.is_finite() or parsed < 0:
        return None
    return parsed


def _get_cart(request):
    """Return a normalized copy of the session cart."""
    raw_cart = request.session.get("cart", {})
    if not isinstance(raw_cart, dict):
        return {}

    cart = {}
    for key, value in raw_cart.items():
        try:
            product_id = int(key)
            quantity = int(value)
        except (TypeError, ValueError):
            continue
        if product_id > 0 and quantity > 0:
            cart[str(product_id)] = quantity
    return cart


def _cart_items(request):
    """Build cart line items and remove products that no longer exist."""
    cart = _get_cart(request)
    product_ids = [int(key) for key in cart]
    products = {
        product.id: product
        for product in Product.objects.filter(id__in=product_ids)
    }

    items = []
    subtotal = Decimal("0.00")
    stale_keys = []

    for key, quantity in cart.items():
        product = products.get(int(key))
        if product is None:
            stale_keys.append(key)
            continue

        item_total = product.final_price * quantity
        items.append(
            {
                "product": product,
                "quantity": quantity,
                "item_total": item_total,
                "available": product.stock >= quantity,
                "max_quantity": product.stock,
            }
        )
        subtotal += item_total

    if stale_keys:
        for key in stale_keys:
            cart.pop(key, None)
        request.session["cart"] = cart
        request.session.modified = True

    return items, subtotal


def _cart_totals(items, subtotal):
    shipping = settings.SHIPPING_COST if items else Decimal("0.00")
    return shipping, subtotal + shipping


def product_list(request):
    products = Product.objects.select_related("category").annotate(
        effective_price=Coalesce("discount_price", "price")
    )

    query = request.GET.get("q", "").strip()
    category_slug = request.GET.get("category", "").strip()
    sort = request.GET.get("sort", "newest").strip()
    min_price = _parse_decimal(request.GET.get("min_price"))
    max_price = _parse_decimal(request.GET.get("max_price"))
    in_stock = request.GET.get("in_stock") == "1"
    on_sale = request.GET.get("on_sale") == "1"

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
    if category_slug:
        products = products.filter(category__slug=category_slug)
    if min_price is not None:
        products = products.filter(effective_price__gte=min_price)
    if max_price is not None:
        products = products.filter(effective_price__lte=max_price)
    if in_stock:
        products = products.filter(stock__gt=0)
    if on_sale:
        products = products.filter(discount_price__isnull=False)

    products = products.order_by(SORT_OPTIONS.get(sort, "-id"))

    paginator = Paginator(products, 12)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(
        request,
        "shop.html",
        {
            "page_obj": page_obj,
            "products": page_obj.object_list,
            "query": query,
            "selected_category": category_slug,
            "sort": sort,
            "min_price": min_price,
            "max_price": max_price,
            "in_stock": in_stock,
            "on_sale": on_sale,
            "total_count": paginator.count,
        },
    )


def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related("category"),
        slug=slug,
    )
    related_products = (
        Product.objects.select_related("category")
        .filter(category=product.category)
        .exclude(pk=product.pk)[:4]
    )

    return render(
        request,
        "product_detail.html",
        {
            "product": product,
            "related_products": related_products,
        },
    )


@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    try:
        quantity = int(request.POST.get("quantity", 1))
    except (TypeError, ValueError):
        quantity = 1
    quantity = max(quantity, 1)

    if product.stock <= 0:
        messages.error(request, f"{product.name} hozircha omborda yo'q.")
        return redirect("cart")

    cart = _get_cart(request)
    key = str(product.id)
    current_quantity = cart.get(key, 0)
    new_quantity = min(current_quantity + quantity, product.stock)

    if new_quantity == current_quantity:
        messages.warning(
            request,
            f"{product.name} uchun omborda {product.stock} dona bor.",
        )
    else:
        cart[key] = new_quantity
        request.session["cart"] = cart
        request.session.modified = True
        messages.success(request, f"{product.name} savatga qo'shildi.")

    return redirect("cart")


@require_POST
def decrease_cart(request, product_id):
    cart = _get_cart(request)
    key = str(product_id)

    if key in cart:
        cart[key] -= 1
        if cart[key] <= 0:
            del cart[key]
        request.session["cart"] = cart
        request.session.modified = True

    return redirect("cart")


@require_POST
def remove_from_cart(request, product_id):
    cart = _get_cart(request)
    key = str(product_id)

    if key in cart:
        del cart[key]
        request.session["cart"] = cart
        request.session.modified = True

    return redirect("cart")


def cart(request):
    items, subtotal = _cart_items(request)
    shipping, total = _cart_totals(items, subtotal)

    return render(
        request,
        "cart.html",
        {
            "items": items,
            "subtotal": subtotal,
            "shipping": shipping,
            "total": total,
        },
    )


@require_http_methods(["GET", "POST"])
def checkout(request):
    items, subtotal = _cart_items(request)

    if not items:
        messages.info(request, "Savatingiz bo'sh. Avval mahsulot tanlang.")
        return redirect("cart")

    shipping, total = _cart_totals(items, subtotal)

    if request.method == "POST":
        form = OrderForm(request.POST)
        if form.is_valid():
            product_ids = [item["product"].id for item in items]

            with transaction.atomic():
                locked_products = {
                    product.id: product
                    for product in Product.objects.select_for_update().filter(
                        id__in=product_ids
                    )
                }

                for item in items:
                    product = locked_products.get(item["product"].id)
                    if product is None or product.stock < item["quantity"]:
                        messages.error(
                            request,
                            f"{item['product'].name} omborda yetarli emas. "
                            "Savatni yangilang.",
                        )
                        return redirect("cart")

                current_subtotal = sum(
                    (
                        locked_products[item["product"].id].final_price
                        * item["quantity"]
                        for item in items
                    ),
                    Decimal("0.00"),
                )
                current_total = current_subtotal + shipping

                order = form.save(commit=False)
                order.user = (
                    request.user if request.user.is_authenticated else None
                )
                order.total = current_total
                order.save()

                for item in items:
                    product = locked_products[item["product"].id]
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        price=product.final_price,
                        quantity=item["quantity"],
                    )
                    product.stock -= item["quantity"]
                    product.save(update_fields=["stock"])

            request.session["cart"] = {}
            request.session.modified = True

            messages.success(request, "Buyurtmangiz muvaffaqiyatli qabul qilindi.")
            return redirect("order_success", order_uuid=order.uuid)
    else:
        initial = {}
        if request.user.is_authenticated:
            initial["full_name"] = (
                request.user.get_full_name() or request.user.username
            )
            initial["email"] = request.user.email
        form = OrderForm(initial=initial)

    return render(
        request,
        "checkout.html",
        {
            "form": form,
            "items": items,
            "subtotal": subtotal,
            "shipping": shipping,
            "total": total,
        },
    )


def order_success(request, order_uuid):
    order = get_object_or_404(
        Order.objects.prefetch_related("items"),
        uuid=order_uuid,
    )
    return render(request, "order_success.html", {"order": order})
