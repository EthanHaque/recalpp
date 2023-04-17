#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import logging
import requests
import base64

import os
import sys

current_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_directory)
server_directory = os.path.join(parent_directory, 'server')

sys.path.append(server_directory)

import utils


def get_course_data() -> list[dict]:
    """Get the course data from the registrar API.

    Returns
    -------
    course_data : list[dict]
        The course data.
    """
    logger = logging.getLogger(__name__)
    token = utils.generate_studnet_app_access_token()
    
    with open(os.path.join(current_directory, "terms"), "r", encoding="UTF-8") as stream:
        terms = stream.read().splitlines()

    with open(os.path.join(current_directory, "department_codes"), "r", encoding="UTF-8") as stream:
        department_codes = stream.read().splitlines()
    
    course_data = []

    logger.info("Getting course data for each term and course code.")
    for term in terms:
        course_data.extend(get_course_data_for_term(term, department_codes, token))

    return course_data



def get_course_data_for_term(term: str, department_codes: list[str], token: str) -> list[dict]:
    """Get the course data for a term from the registrar API.

    Parameters
    ----------
    term : str
        The semester term.

    department_codes : list[str]
        The course codes.

    token : str
        The access token for the student app.
    
    Returns
    -------
    course_data : list[dict]
        The course data.
    """
    logger = logging.getLogger(__name__)
    course_data = []
    logger.info("Getting course data for term %s.", term)
    for department_code in department_codes:
        term_and_course_data = get_course_data_for_term_and_course_code(term, department_code, token)
        course_data.extend(term_and_course_data)
    
    return course_data


def get_course_data_for_term_and_course_code(term: str, course_code: str, token: str) -> list[dict]:
    """Get the course data for a term and course code from the registrar API.

    Parameters
    ----------
    term : str
        The semester term.

    course_code : str
        The course code.

    token : str
        The access token for the student app.
    
    Returns
    -------
    course_data : list[dict]
        The course data.
    """
    logger = logging.getLogger(__name__)
    try:
        int(term)
    except ValueError:
        logger.error("Term %s is not a valid term.", term)
        return []
    if len(term) != 4:
        logger.error("Term %s is not a valid term.", term)
        return []
    
    if len(course_code) != 3:
        logger.error("Course code %s is not a valid course code.", course_code)
        return []
    course_code = course_code.upper()
    
    url = f"https://api.princeton.edu:443/student-app/1.0.2/courses/courses?term={term}&subject={course_code}&fmt=json"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {token}",
    }
    logger.info("Getting course data for term %s and course code %s.", term, course_code)
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    json = response.json()
    return json


def setup_logging():
    """Setup logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%d-%m-%Y %H:%M:%S",
    )


def main():
    """Main function."""
    setup_logging()
    courses = get_course_data()
    print(courses)


if __name__ == "__main__":
    main()
