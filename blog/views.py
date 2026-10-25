import logging

from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, redirect, render

from products.models import Product

from .forms import ContactForm
from .models import ContactMessage, Post

logger = logging.getLogger(__name__)


def home(request):
    products = list(
        Product.objects.select_related("category").order_by("-id")[:8]
    )
    latest_posts = Post.objects.all()[:3]

    return render(
        request,
        "index.html",
        {
            "featured_products": products[:4],
            "recent_products": products,
            "latest_posts": latest_posts,
        },
    )


def post_list(request):
    paginator = Paginator(Post.objects.all(), 6)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(
        request,
        "blog_list.html",
        {"page_obj": page_obj, "posts": page_obj.object_list},
    )


def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, "blog_detail.html", {"post": post})


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            ContactMessage.objects.create(**form.cleaned_data)
            try:
                email = EmailMessage(
                    subject=form.cleaned_data["subject"],
                    body=(
                        f"Yuboruvchi: {form.cleaned_data['name']} "
                        f"<{form.cleaned_data['email']}>\n\n"
                        f"{form.cleaned_data['message']}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.CONTACT_EMAIL],
                    reply_to=[form.cleaned_data["email"]],
                )
                email.send(fail_silently=False)
            except Exception:
                logger.exception("Contact email yuborilmadi")
                messages.warning(
                    request,
                    "Xabar saqlandi, lekin email yuborilmadi. "
                    "Administrator uni panelda ko'radi.",
                )
            else:
                messages.success(request, "Xabaringiz yuborildi. Rahmat!")
            return redirect("contact")
    else:
        form = ContactForm()

    return render(request, "contact.html", {"form": form})
