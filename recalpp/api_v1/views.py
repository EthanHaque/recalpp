from rest_framework import viewsets, generics
from recalpp.data_ingestion.models import (
    Course,
    Instructor,
    CourseInstructor,
    CrossListing,
    Class,
    Meeting,
    Major,
    RequiredCourse,
)
from api_v1.serializers import (
    CourseSerializer,
    InstructorSerializer,
    CourseInstructorSerializer,
    CrossListingSerializer,
    ClassSerializer,
    MeetingSerializer,
    MajorSerializer,
    RequiredCourseSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from recalpp.schedule_builder.models import UserProfile

import json


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    # TODO allow for query by multiple things like distribution
    def get_queryset(self):
        queryset = self.queryset
        term_code = self.request.query_params.get("term_code", None)
        catalog_number = self.request.query_params.get("catalog_number", None)
        subject_code = self.request.query_params.get("subject_code", None)
        title = self.request.query_params.get("title", None)
        distribution = self.request.query_params.get("distribution", None)

        if term_code is not None:
            queryset = queryset.filter(term_code=term_code)
        if catalog_number is not None:
            queryset = queryset.filter(catalog_number=catalog_number)
        if subject_code is not None:
            queryset = queryset.filter(subject_code__iexact=subject_code)
        if title is not None:
            queryset = queryset.filter(title__icontains=title)
        if distribution is not None:
            queryset = queryset.filter(distribution_areas__icontains=distribution)

        return queryset


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer


class CourseInstructorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CourseInstructor.objects.all()
    serializer_class = CourseInstructorSerializer


class CrossListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CrossListing.objects.all()
    serializer_class = CrossListingSerializer


class ClassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class MeetingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer


class MeetingsForCourseView(generics.ListAPIView):
    serializer_class = MeetingSerializer

    def get_queryset(self):
        guid = self.kwargs["guid"]
        course = Course.objects.get(guid=guid)
        class_ids = course.class_set.all().values_list("id", flat=True)
        return Meeting.objects.filter(class_obj__id__in=class_ids)


class MajorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Major.objects.all()
    serializer_class = MajorSerializer

    def get_queryset(self):
        queryset = self.queryset
        major = self.request.query_params.get("major", None)
        if major is not None:
            queryset = queryset.filter(major=major)
        return queryset


class RequiredCourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequiredCourse.objects.all()
    serializer_class = RequiredCourseSerializer

    def get_queryset(self):
        queryset = self.queryset
        major_name = self.request.query_params.get("major", None)
        if major_name is not None:
            queryset = queryset.filter(major__name=major_name)
        return queryset


@api_view(["GET"])
def get_current_term(request):
    current_term = 1242
    return Response({"current_term": current_term})


@api_view(["GET"])
def get_subject_codes(request):
    with open("./data/department_codes", "r") as f:
        subject_codes = f.read().splitlines()
    return Response({"subject_codes": subject_codes})


@api_view(["GET"])
def get_distributions(request):
    with open("./data/distributions", "r") as f:
        distributions = f.read().splitlines()
    return Response({"distributions": distributions})


@csrf_exempt
def save_user_profile(request):
    if request.method == "POST":
        user_data = request.POST.get("user_data")

        # You may need to parse the user_data from JSON if it is sent as a JSON string
        user_data = json.loads(user_data)

        # Assuming the user is authenticated, retrieve the user object
        user = request.user

        # Create a UserProfile instance with the User object data
        user_profile, _ = UserProfile.objects.get_or_create(user=user)
        user_profile.enrolled_courses = user_data["enrolledCourses"]
        user_profile.course_history = user_data["courseHistory"]
        user_profile.course_meetings = user_data["courseMeetings"]
        user_profile.notes = user_data["notes"]
        user_profile.major = user_data["major"]
        user_profile.save()

        return JsonResponse({"status": "success"})
    else:
        return JsonResponse({"status": "failed"})


@login_required
def get_user_profile(request):
    if request.method == "GET":
        user = request.user
        try:
            user_profile = UserProfile.objects.get(user=user)
            response_data = {
                "enrolledCourses": user_profile.enrolled_courses,
                "courseHistory": user_profile.course_history,
                "courseMeetings": user_profile.course_meetings,
                "notes": user_profile.notes,
                "major": user_profile.major,
            }
            return JsonResponse(response_data)
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile not found"}, status=404)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
