from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("contact/", views.contact, name="contact"),
    path("blog/", views.post_list, name="post_list"),
    path("blog/<int:pk>/", views.post_detail, name="post_detail"),
]
