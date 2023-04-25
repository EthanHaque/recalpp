"""Recal++ URL Configuration for the schedule_builder app."""

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = "schedule_builder"
urlpatterns = [
    path("", views.index, name="index"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
