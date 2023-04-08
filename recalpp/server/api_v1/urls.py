
"""recalpp URL Configuration for schedule_builder"""

from django.urls import path
from . import views

urlpatterns = [
   path('', views.get_routes, name="routes"),
   path('majors', views.get_major_information, name="majors"),
   path('courses', views.get_courses_information, name="courses")
   ]
