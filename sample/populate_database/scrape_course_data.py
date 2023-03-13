#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import logging
import requests
import yaml


def get_course_data() -> list[dict]:
    """Get the course data from the registrar API.

    Returns
    -------
    course_data : list[dict]
        The course data.
    """
    url = "https://api.princeton.edu/registrar/course-offerings/classes/1234"
    payload = {}

    with open("config/application.yaml", "r", encoding="UTF-8") as stream:
        try:
            config = yaml.safe_load(stream)
            headers = config["registrar_api"]["headers"]
        except yaml.YAMLError as exc:
            logging.error(exc)
            raise exc
        # TODO go back through and add final except blocks.

    try:
        logging.info("Getting course data from the registrar API...")
        response = requests.request(
            "GET", url, headers=headers, data=payload, timeout=10
        )
        response.raise_for_status()
        logging.info("Successfully got course data from the registrar API.")
    except requests.exceptions.HTTPError as exc:
        logging.error(exc)
        raise exc
    except requests.exceptions.Timeout as exc:
        logging.error(exc)
        raise exc
    except Exception as exc:
        logging.error(exc)
        raise exc
    
    return response.json()["classes"]["class"]


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
