from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

import utils

def index(request):
    """The homepage for the schedule builder app.
    
    Parameters
    ----------
    request : HttpRequest
        The request object.
        
    Returns
    -------
    HttpResponse
        The response object.
    """
    # connect to db
    courses_collection = utils.get_courses_data_collection()

    departmental_collection = utils.get_departmental_data_collection()

    major_info = departmental_collection.find_one({"type": "Major", "code": "COS-BSE"})

    major_info.pop("_id")
    # TODO: remove this from prototype

    # get all courses from the collection
    courses = courses_collection.find({})
    context = {'name': 'Rafay Khan', 'courses': courses, 'degree_progress': major_info}
    return render(request, 'schedule_builder/temphomepage.html', context)