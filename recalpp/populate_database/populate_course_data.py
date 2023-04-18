#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import logging

import pymongo
import pymongo.errors as mongo_err

import scrape_course_data

import os
import sys

current_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_directory)
server_directory = os.path.join(parent_directory, "server")

sys.path.append(server_directory)

import utils


def setup_logging():
    """Setup logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%d-%m-%Y %H:%M:%S",
    )


def write_course_data_to_db(
    courses: list[dict], courses_collection: pymongo.collection.Collection
):
    """Write the course data to the database.

    Parameters
    ----------
    courses : list[dict]
        The course data.
    courses_collection : pymongo.collection.Collection
        The collection in the database to write the course data to.
    """
    if not isinstance(courses, list):
        raise TypeError("courses must be of type list")
    if not isinstance(courses_collection, pymongo.collection.Collection):
        raise TypeError(
            "courses_collection must be of type pymongo.collection.Collection"
        )
    if not courses:
        raise ValueError("courses cannot be empty")

    try:
        logging.info("Writing course data to the database...")
        courses_collection.insert_many(courses)
        logging.info("Successfully wrote course data to the database.")
    except mongo_err.BulkWriteError as exc:
        logging.error(exc)
        raise exc


def main():
    """Main function."""
    setup_logging()
    client = utils.get_db_handle()
    database = client["recalpp"]
    courses_collection = database["courses"]

    courses = scrape_course_data.get_course_data()
    courses = scrape_course_data.get_all_course_details(courses)

    # start transaction
    with client.start_session() as session:
        with session.start_transaction():
            courses_collection.delete_many({})
            write_course_data_to_db(courses, courses_collection)


if __name__ == "__main__":
    main()
