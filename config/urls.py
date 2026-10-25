"""URL configuration for the config project."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

admin.site.site_header = "MultiShop boshqaruv paneli"
admin.site.site_title = "MultiShop admin"
admin.site.index_title = "Boshqaruv"
admin.site.site_url = "/"

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("shop/", include("products.urls")),
    path("", include("blog.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
else:
    # Small-project fallback. For a real deployment use S3/Cloudinary or a
    # persistent disk; Django should not normally serve media in production.
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
