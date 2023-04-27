from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# @login_required
def index(request):
    """View function for home page of site."""
    return render(request, "schedule_builder/index.html",)