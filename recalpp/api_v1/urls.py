from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api_v1.views import (
    CourseViewSet,
    InstructorViewSet,
    CourseInstructorViewSet,
    CrossListingViewSet,
    ClassViewSet,
    MeetingViewSet,
    MajorViewSet,
    RequiredCourseViewSet,
    get_current_term,
    get_subject_codes,
    get_distributions,
    MeetingsForCourseView,
    save_user_profile,
    get_user_profile,
)
from config import api_router

router = api_router.router

router.register(r"courses", CourseViewSet, basename="course")
router.register(r"instructors", InstructorViewSet, basename="instructor")
router.register(r"course_instructors", CourseInstructorViewSet, basename="course_instructor")
router.register(r"crosslistings", CrossListingViewSet, basename="crosslisting")
router.register(r"classes", ClassViewSet, basename="class")
router.register(r"meetings", MeetingViewSet, basename="meeting")
router.register(r"majors", MajorViewSet, basename="major")
router.register(r"required_courses", RequiredCourseViewSet, basename="required_course")

urlpatterns = [
    path("course_meetings/<str:guid>/", MeetingsForCourseView.as_view(), name="course_meetings"),
    path("save_user_profile/", save_user_profile, name="save_user_profile"),
    path("get_user_profile/", get_user_profile, name="get_user_profile"),
    path("current_term/", get_current_term, name="current_term"),
    path("subject_codes/", get_subject_codes, name="subject_codes"),
    path("distributions/", get_distributions, name="distributions"),
    path("required_courses/", RequiredCourseViewSet.as_view({'get': 'list'}), name="required_courses"),
    path("majors", MajorViewSet.as_view({'get': 'list'}), name="majors"),
    path("", include(router.urls)),
]
