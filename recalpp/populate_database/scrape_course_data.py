#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import logging
import requests
import base64

import recalpp.utils as utils


def get_course_data() -> list[dict]:
    """Get the course data from the registrar API.

    Returns
    -------
    course_data : list[dict]
        The course data.
    """
    url = "https://api.princeton.edu:443/student-app/1.0.2/courses/courses"
    token = utils.generate_studnet_app_access_token()
    print(token)


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
