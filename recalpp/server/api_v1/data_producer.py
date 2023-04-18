#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Interface to the database to retrieve data for the API."""

import logging
import re
from pymongo.collation import Collation
import utils

DISTRIBUTIONS = set(("CD", "EC", "EM",  "HA", 
                     "LA", "SA", "QCR", "SEL", 
                     "SEN"))

def handle_query(query: str, parsed_search: dict):
    query = query.upper()
    if query in DISTRIBUTIONS:
        parsed_search["distributions"].append(query)
        return

    if query.isalpha():
        parsed_search["course_code"] = query
        return

    if query.isnumeric():
        parsed_search["course_number"] = query
        return

    parsed_search["course_code"] = re.sub(r"[A-Z]{3}", "", query)
    parsed_search["course_number"] = re.sub(r"\d{1,3}", "", query)
    return

def get_major_information(major_code: str) -> dict:
    """Get the major information from the database.

    Parameters
    ----------
    major_code : str
        The major code.

    Returns
    -------
    major_info : dict
        The major information.
    """
    major_code = major_code.upper()
    logging.info("Getting major information for %s.", major_code)
    db_collection = utils.get_departmental_data_collection()

    query = {"type": "Major", "code": major_code}
    projection = {"_id": 0}
    major_info = db_collection.find_one(query, projection)

    if major_info:
        logging.info("Successfully retrieved major information.")
        return major_info
    else:
        logging.error("Failed to retrieve major information.")
        return None


def get_courses_information(search: str) -> list:
    """Get the course information from the database.

    Parameters
    ----------
    search : str
        The search string.

    Returns
    -------
    course_info : list
        The course information.
    """
    if search is None:
        return []

    db_collection = utils.get_courses_data_collection()

    logging.info("Getting course info for %s", search)
    search = search.upper()

    if search == "*":
        return list(db_collection.find({}, {"_id": 0}))

    # TODO improve this. Consider using collations + removing the regex
    query = {"crosslistings": {"$regex": search}}
    projection = {"_id": 0}
    course_info = db_collection.find(query, projection)

    if course_info:
        logging.info("Successfully retrieved course information.")
        return list(course_info)
    else:
        logging.error("Failed to retrieve course information.")
        return None
