#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Interface to the database to retrieve data for the API."""

import logging
import re
import utils

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

    logging.info("Getting course info for %s", search)

    if search == "*":
        return list(db_collection.find({"term_code": current_term}))

    search = parse_search(search)

    query = build_db_query(search)

    projection = {"_id": 0} # Don't return the _id field
    # TODO improve this. Consider using collations + removing the regex
    course_info = db_collection.find(query, projection)

    if course_info:
        logging.info("Successfully retrieved course information.")
        return list(course_info)
    else:
        logging.error("Failed to retrieve course information.")
        return None


def handle_query(query: str, parsed_search: dict):
    """
    parses the search string for desired query tokens

    Parameters
    ----------
    query : str
        a query that must be mapped to token
    parsed_search : str
        dictionary containing 
    """

    distributions = set(("CD", "EC", "EM",
                         "HA", "LA", "SA", 
                         "QCR", "SEL","SEN"))

    query = query.upper()
    if query in distributions:
        parsed_search["distributions"].append(query)
        return

    if query.isalpha():
        parsed_search["subject_code"] = query
        return

    if query.isnumeric():
        parsed_search["course_number"] = query
        return

    parsed_search["course_number"] = re.sub(r"[A-Z]{3}", "", query)
    parsed_search["subject_code"] = re.sub(r"\d{1,3}", "", query)
    return


def parse_search(search: str) -> dict:
    """
    parses the search string for desired query tokens

    Parameters
    ----------
    search : str
        search string for a course

    Returns
    -------
    dict
        a dictionary with desired tokens
    """

    queries = search.split()

    parsed_search = {"distributions": [],
                     "course_number": "", "subject_code": ""}

    for query in queries:
        handle_query(query, parsed_search)

    return parsed_search

def build_db_query(parsed_search: dict) -> dict:
    query = {"term_code": "1242"}
    
    print(parsed_search)

    if parsed_search["subject_code"]:
        query["subject_code"] = parsed_search["subject_code"]

    if parsed_search["course_number"] != "":
        query["catalog_number"] = { "$regex" : parsed_search["course_number"]}

    return query
