from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

import utils

def index(request):
    # connect to db
    client = utils.get_db_handle()
    db = client["recalpp"]
    collection = db["courses"]
    # get all courses from the collection
    courses = collection.find({})
    context = {'name': 'Ethan Haque', 'courses': courses}
    return render(request, 'schedule_builder/temphomepage.html', context)