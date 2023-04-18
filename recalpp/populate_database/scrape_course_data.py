#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import logging
import os
import sys
import json

current_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_directory)
server_directory = os.path.join(parent_directory, 'server')

sys.path.append(server_directory)
import requests

import concurrent.futures as cfutures

import utils

def get_course_data_multithreaded() -> list[dict]:
    """Get the course data from the registrar API using multithreading.
    
    This function reads the terms and department codes from the respective files, and then
    fetches course data for each term and department code concurrentl.
    
    Returns
    -------
    course_data : list[dict]
        The course data fetched from the API.

    Notes
    -----
    - Any errors that occur during the execution of tasks are logged, and the function continues to process the remaining tasks.
    """
    logger = logging.getLogger(__name__)
    token = utils.generate_studnet_app_access_token()

    with open(os.path.join(current_directory, "terms"), "r", encoding="UTF-8") as stream:
        terms = stream.read().splitlines()

    with open(os.path.join(current_directory, "department_codes"), "r", encoding="UTF-8") as stream:
        department_codes = stream.read().splitlines()

    course_data = []

    logger.info("Getting course data for each term and course code concurrently.")
    # Max workers is 2 because the registrar API is extermely unstable and will return 500 errors if too many requests are made at once.
    # TODO: does not gracefully exit on keyboard interrupt. 
    with cfutures.ThreadPoolExecutor(max_workers=2) as executor: 
        futures = []
        for term in terms:
            for department_code in department_codes:
                future = executor.submit(get_course_data_for_term_and_course_code, term, department_code, token)
                futures.append(future)

        for future in cfutures.as_completed(futures):
            try:
                result = future.result()
                course_data.extend(result)
            except Exception as exc:
                logger.error("Error occurred while fetching course data: %s", exc)

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
    logger.info("Getting course data for term %s.", term)
    term_and_course_data = []
    for department_code in department_codes:
        course_data = get_course_data_for_term_and_course_code(term, department_code, token)
        term_and_course_data.extend(course_data)
    
    return term_and_course_data


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
    response = requests.get(url, headers=headers, timeout=60)
    response.raise_for_status()

    courses_data = response.json()
    flattened_courses = flatten_courses(courses_data)

    return flattened_courses



def flatten_courses(data: dict) -> list[dict]:
    """
    Flatten the course data and add term and code to each course.

    This function iterates through the terms and subjects in the provided data,
    and then creates a flattened list of courses with the term and code added
    to each course as new fields.

    Parameters
    ----------
    data : dict
        The course data as provided by the API.

    Returns
    -------
    flattened_courses : list[dict]
        A list of flattened course data with term and code added to each course.
    """
    flattened_courses = []

    for term in data["term"]:
        if term["code"]:
            term_code = term["code"]
            term_name = term["name"]
            for subject in term["subjects"]:
                subject_code = subject["code"]
                for course in subject["courses"]:
                    flattened_course = course.copy()
                    flattened_course["term_code"] = term_code
                    flattened_course["term_name"] = term_name
                    flattened_course["subject_code"] = subject_code
                    flattened_courses.append(flattened_course)

    return flattened_courses

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
    courses = get_course_data_multithreaded()
    print(courses)


if __name__ == "__main__":
    main()
