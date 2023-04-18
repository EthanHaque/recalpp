#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Interface to the database to retrieve data for the API."""

import logging
import bson
import utils
import re

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
    projection = {"_id": 0} # Don't return the _id field
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

    # TODO: This is terrible, make this update automatically and make it
    # TODO: a constant somewhere outside of this function
    current_term = "1242"
    search = re.escape(search)

    logging.info("Getting course info for %s", search)

    if search == "*":
        return list(db_collection.find({"term_code": current_term}))
    
    query = {
        "term_code": current_term, 
        "crosslistings_string": {"$regex": search, "$options": "i"}
        }
    projection = {"_id": 0} # Don't return the _id field
    # TODO improve this. Consider using collations + removing the regex
    course_info = db_collection.find(query, projection)

    if course_info:
        logging.info("Successfully retrieved course information.")
        return list(course_info)
    else:
        logging.error("Failed to retrieve course information.")
        return None
