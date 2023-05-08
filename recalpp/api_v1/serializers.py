from rest_framework import serializers
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


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = "__all__"


class CourseInstructorSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer()

    class Meta:
        model = CourseInstructor
        fields = "__all__"


class CrossListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrossListing
        fields = "__all__"


class MeetingSerializer(serializers.ModelSerializer):
    class_id = serializers.IntegerField(source="class_obj.id", read_only=True)
    class_section = serializers.CharField(source="class_obj.section", read_only=True)
    class_subject_code = serializers.CharField(source="class_obj.course.subject_code", read_only=True)
    class_catalog_number = serializers.CharField(source="class_obj.course.catalog_number", read_only=True)

    class Meta:
        model = Meeting
        fields = "__all__"


class ClassSerializer(serializers.ModelSerializer):
    meetings = MeetingSerializer(many=True)

    class Meta:
        model = Class
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    # courseinstructor_set = CourseInstructorSerializer(many=True)
    # crosslisting_set = CrossListingSerializer(many=True)
    # class_set = ClassSerializer(many=True)

    class Meta:
        model = Course
        fields = "__all__"


class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = "__all__"


class RequiredCourseSerializer(serializers.ModelSerializer):
    # the course should be a Course object and not just the id
    course = CourseSerializer()
    class Meta:
        model = RequiredCourse
        fields = ["course"]