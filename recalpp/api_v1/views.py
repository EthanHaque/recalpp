from rest_framework import viewsets, generics
from recalpp.data_ingestion.models import Course, Instructor, CourseInstructor, CrossListing, Class, Meeting
from api_v1.serializers import (CourseSerializer, InstructorSerializer, CourseInstructorSerializer,
                                 CrossListingSerializer, ClassSerializer, MeetingSerializer)
from rest_framework.decorators import api_view
from rest_framework.response import Response

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    # TODO allow for query by multiple things like distribution
    def get_queryset(self):
        queryset = self.queryset
        term_code = self.request.query_params.get('term_code', None)
        catalog_number = self.request.query_params.get('catalog_number', None)
        subject_code = self.request.query_params.get('subject_code', None)
        title = self.request.query_params.get('title', None)
        distribution = self.request.query_params.get('distribution', None)

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
        guid = self.kwargs['guid']
        course = Course.objects.get(guid=guid)
        class_ids = course.class_set.all().values_list('id', flat=True)
        return Meeting.objects.filter(class_obj__id__in=class_ids)


@api_view(['GET'])
def get_current_term(request):
    current_term = 1242
    return Response({'current_term': current_term})

@api_view(['GET'])
def get_subject_codes(request):
    with open("./data/department_codes", "r") as f:
        subject_codes = f.read().splitlines()
    return Response({'subject_codes': subject_codes})

@api_view(['GET'])
def get_distributions(request):
    with open("./data/distributions", "r") as f:
        distributions = f.read().splitlines()
    return Response({'distributions': distributions})

