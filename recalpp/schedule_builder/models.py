from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    enrolled_courses = models.JSONField(default=dict)
    course_history = models.JSONField(default=dict)
    course_meetings = models.JSONField(default=dict)
    notes = models.TextField(blank=True, default="")
    major = models.CharField(max_length=100, blank=True, default="")
