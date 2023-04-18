from django.http import HttpRequest
from django.http import JsonResponse
from . import data_producer


def get_major_information(request: HttpRequest):
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


def get_courses_information(request: HttpRequest):
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
