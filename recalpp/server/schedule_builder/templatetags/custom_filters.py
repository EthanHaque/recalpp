from django import template
from django.template.defaultfilters import stringfilter

import datetime

register = template.Library()

@register.filter
@stringfilter
def time(value, format_string):
    """Converts a 24-hour time string to a 12-hour time string.

    Parameters
    ----------
    value : str
        The 24-hour time string.
    format_string : str
        The format string.

    Returns
    -------
    formatted_time : str
        The 12-hour time string.
    """
    try:
        hour = int(value)
        dt = datetime.datetime.strptime(str(hour), "%H")
        formatted_time = dt.strftime(format_string)
    except ValueError:
        formatted_time = value

    print(formatted_time)
    return formatted_time
