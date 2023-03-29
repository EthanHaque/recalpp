from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

import utils

def index(request):
    # connect to db
    collection = utils.get_courses_data_collection()
    # get all courses from the collection
    courses = collection.find({})
    context = {'name': 'Ethan Haque', 'courses': courses}
    return render(request, 'schedule_builder/temphomepage.html', context)