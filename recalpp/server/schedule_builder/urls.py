"""recalpp URL Configuration for schedule_builder"""

from django.conf.urls.static import static
from django.conf import settings

from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
