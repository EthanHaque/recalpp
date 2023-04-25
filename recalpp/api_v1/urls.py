from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api_v1.views import (CourseViewSet, InstructorViewSet, CourseInstructorViewSet,
                          CrossListingViewSet, ClassViewSet, MeetingViewSet, get_current_term,
                            get_subject_codes, get_distributions, MeetingsForCourseView)
from config import api_router

router = api_router.router

router.register(r"courses", CourseViewSet, basename="course")
router.register(r"instructors", InstructorViewSet, basename="instructor")
router.register(r"course_instructors", CourseInstructorViewSet, basename="course_instructor")
router.register(r"crosslistings", CrossListingViewSet, basename="crosslisting")
router.register(r"classes", ClassViewSet, basename="class")
router.register(r"meetings", MeetingViewSet, basename="meeting")

urlpatterns = [
    path('course_meetings/<str:guid>/', MeetingsForCourseView.as_view(), name='course_meetings'),
    path("current_term/", get_current_term, name="current_term"),
    path("subject_codes/", get_subject_codes, name="subject_codes"),
    path("distributions/", get_distributions, name="distributions"),
    path("", include(router.urls)),
]
