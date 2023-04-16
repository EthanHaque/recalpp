from django.shortcuts import render
from django.http import JsonResponse

from . import data_producer


def get_routes(request):  # TODO get rid of this function

    routes = [
        {
            "Endpoint": "/course/",
            "method": "GET",
            "body": None,
            "description": "Returns an array of courses",
        },
        {
            "Endpoint": "/course/id",
            "method": "GET",
            "body": None,
            "description": "Returns a single course object",
        },
        {
            "Endpoint": "/majors",
            "method": "GET",
            "body": None,
            "description": "Returns dependency information about a major",
        },
    ]

    return JsonResponse(routes, safe=False)


def get_major_information(request):
    """Get the major information from the database.

    Parameters
    ----------
    request : HttpRequest
        The request object.

    Returns
    -------
    major_info : dict
        The major information including the major code, name,
        dependencies, etc.
    """
    major_code = request.GET.get("major_code")
    major_info = data_producer.get_major_information(major_code)
    # TODO: make safe
    return JsonResponse(major_info, safe=False)


def get_courses_information(request):
    """Get the courses information from the database.

    Parameters
    ----------
    request : HttpRequest
        The request object.

    Returns
    -------
    courses_info : dict
        The courses information including the major code, name,
        dependencies, etc.
    """
    search = request.GET.get("search")
    courses_info = data_producer.get_courses_information(search)
    # TODO: make safe
    return JsonResponse(courses_info, safe=False)
