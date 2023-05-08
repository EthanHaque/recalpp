from django.db import models

class Course(models.Model):
    guid = models.CharField(max_length=255, unique=True)
    course_id = models.CharField(max_length=255)
    catalog_number = models.CharField(max_length=255)
    title = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    track = models.CharField(max_length=255)
    description = models.TextField()
    seat_reservations = models.CharField(max_length=255)
    term_code = models.CharField(max_length=255)
    term_name = models.CharField(max_length=255)
    subject_code = models.CharField(max_length=255)
    crosslistings_string = models.TextField()
    distribution_areas = models.CharField(max_length=255)

class Instructor(models.Model):
    emplid = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)

class CourseInstructor(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)

class CrossListing(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    catalog_number = models.CharField(max_length=255)

class Class(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    class_number = models.CharField(max_length=255)
    section = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    pu_calc_status = models.CharField(max_length=255)
    seat_status = models.CharField(max_length=255)
    type_name = models.CharField(max_length=255)
    capacity = models.IntegerField()
    enrollment = models.IntegerField()

class Meeting(models.Model):
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="meetings")
    start_date = models.DateField()
    end_date = models.DateField()
    meeting_number = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    days = models.CharField(max_length=255)

class Major(models.Model):
    name = models.CharField(max_length=255)

class RequiredCourse(models.Model):
    major = models.ForeignKey(Major, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
