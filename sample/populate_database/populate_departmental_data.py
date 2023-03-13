#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with departmental data."""


import urllib.parse
import logging
import os

import pymongo
import pymongo.errors as mongo_err
import yaml

# TODO use dotenv instead of a yaml file for deployment.


def connect_to_db() -> pymongo.database.Database:
    """Connect to the departmental_data database.

    Returns
    -------
    client : pymongo.database.Database
        The database client for departmental_data.
    """
    db_credentials = get_db_credentials()
    username = urllib.parse.quote_plus(db_credentials["username"])
    password = urllib.parse.quote_plus(db_credentials["password"])
    db_name = urllib.parse.quote_plus(db_credentials["database"])

    if not username or not password or not db_name:
        raise ValueError("Invalid database credentials.")

    try:
        client = pymongo.MongoClient(
            f"mongodb+srv://{username}:{password}@{db_name}/?retryWrites=true&w=majority",
        )
        connected_server_info = client.server_info()
        logging.info(
            "Connected to MongoDB server version %s.", connected_server_info["version"]
        )
    except mongo_err.ConnectionFailure as exc:
        logging.error(exc)
        raise exc

    if client:
        logging.info("Successfully connected to the database.")
    else:
        logging.error("Connection to the database failed.")
        raise mongo_err.ConnectionFailure("Connection to the database failed")

    return client["departmental_data"]


def get_db_credentials():
    """Get the database credentials.

    Returns
    -------
    db_credentials : dict
        The database credentials.
    """
    with open("config/application.yaml", "r", encoding="UTF-8") as stream:
        try:
            config = yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            logging.error(exc)
            raise exc

    db_credentials = {
        "username": config["mongodb"]["username"],
        "password": config["mongodb"]["password"],
        "database": config["mongodb"]["database"],
    }
    return db_credentials


def setup_logging():
    """Setup logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%d-%m-%Y %H:%M:%S",
    )


def get_degree_programs(degree_programs_dir: str) -> list:
    """Get data about the degree programs from the YAML files.

    Parameters
    ----------
    degree_programs_dir : str
        The path to the directory containing the YAML files for the
        degree programs (AB and BSE).

    Returns
    -------
    degree_programs : list
        The degree programs.
    """
    if not isinstance(degree_programs_dir, str):
        raise TypeError("Invalid type for degree programs directory.")
    if not os.path.isdir(degree_programs_dir):
        raise ValueError("Invalid directory for degree programs.")

    degree_programs = []
    for degree_program in os.listdir(degree_programs_dir):
        if not degree_program.endswith(".yaml"):
            continue

        with open(
            os.path.join(degree_programs_dir, degree_program), "r", encoding="UTF-8"
        ) as stream:
            try:
                degree_info = yaml.safe_load(stream)
                degree_programs.append(degree_info)
            except yaml.YAMLError as exc:
                logging.error(exc)
                raise exc
    return degree_programs


def get_major_programs(major_programs_dir: str) -> list:
    """Get data about the major programs from the YAML files.

    Parameters
    ----------
    major_programs_dir : str
        The path to the directory containing the YAML files for the
        major programs.

    Returns
    -------
    major_programs : list
        The major programs.
    """
    if not isinstance(major_programs_dir, str):
        raise TypeError("Invalid type for major programs directory.")
    if not os.path.isdir(major_programs_dir):
        raise ValueError("Invalid directory for major programs.")

    major_programs = []
    for major_program in os.listdir(major_programs_dir):
        if not major_program.endswith(".yaml"):
            continue

        with open(
            os.path.join(major_programs_dir, major_program), "r", encoding="UTF-8"
        ) as stream:
            try:
                major_info = yaml.safe_load(stream)
                major_programs.append(major_info)
            except yaml.YAMLError as exc:
                logging.error(exc)
                raise exc
    return major_programs


def get_minor_programs(minor_programs_dir: str) -> list:
    """Get data about the minor programs from the YAML files.

    Parameters
    ----------
    minor_programs_dir : str
        The path to the directory containing the YAML files for the
        minor programs (formerly certificate programs).

    Returns
    -------
    minor_programs : list
        The minor programs.
    """
    if not isinstance(minor_programs_dir, str):
        raise TypeError("Invalid type for minor programs directory.")
    if not os.path.isdir(minor_programs_dir):
        raise ValueError("Invalid directory for minor programs.")

    minor_programs = []
    for minor_program in os.listdir(minor_programs_dir):
        if not minor_program.endswith(".yaml"):
            continue

        with open(
            os.path.join(minor_programs_dir, minor_program), "r", encoding="UTF-8"
        ) as stream:
            try:
                minor_info = yaml.safe_load(stream)
                minor_programs.append(minor_info)
            except yaml.YAMLError as exc:
                logging.error(exc)
                raise exc
    return minor_programs


def write_departmental_data_to_db(
    departmental_data_collection: pymongo.collection.Collection, departmental_data: list
):
    """Write the departmental data to the database.

    Parameters
    ----------
    departmental_data_collection : pymongo.collection.Collection
        The collection in the database to write the departmental data to.
    departmental_data : list
        The departmental data to write to the database.
    """
    if not isinstance(departmental_data_collection, pymongo.collection.Collection):
        raise TypeError("Invalid type for departmental data collection.")
    if not departmental_data:
        raise ValueError("Invalid departmental data.")
    if not isinstance(departmental_data, list):
        raise TypeError("Invalid type for departmental data.")

    try:
        logging.info("Writing departmental data to the database...")
        departmental_data_collection.insert_many(departmental_data)
        logging.info("Successfully wrote departmental data to the database.")
    except pymongo.errors.BulkWriteError as exc:
        logging.error(exc)
        raise exc


def get_departmental_data(
    degree_programs_dir: str, major_programs_dir: str, minor_programs_dir: str
) -> list:
    """Get the departmental data.

    Parameters
    ----------
    degree_programs_dir : str
        The path to the directory containing the YAML files for the
        degree programs (AB and BSE).
    major_programs_dir : str
        The path to the directory containing the YAML files for the
        major programs.
    minor_programs_dir : str
        The path to the directory containing the YAML files for the
        minor programs (formerly certificate programs).

    Returns
    -------
    departmental_data : list
        The departmental data.
    """
    if not isinstance(degree_programs_dir, str):
        raise TypeError("Invalid type for degree programs directory.")
    if not os.path.isdir(degree_programs_dir):
        raise ValueError("Invalid directory for degree programs.")
    if not isinstance(major_programs_dir, str):
        raise TypeError("Invalid type for major programs directory.")

    if not os.path.isdir(major_programs_dir):
        raise ValueError("Invalid directory for major programs.")
    if not isinstance(minor_programs_dir, str):
        raise TypeError("Invalid type for minor programs directory.")
    if not os.path.isdir(minor_programs_dir):
        raise ValueError("Invalid directory for minor programs.")

    degree_programs = get_degree_programs(degree_programs_dir)
    major_programs = get_major_programs(major_programs_dir)
    minor_programs = get_minor_programs(minor_programs_dir)

    departmental_data = degree_programs + major_programs + minor_programs

    return departmental_data


def main():
    r"""Main function."""
    degree_programs_dir = (
        r"C:\Users\ethan_haque\Desktop\repos\Princeton-Departmental-Data\degrees"
    )
    major_programs_dir = (
        r"C:\Users\ethan_haque\Desktop\repos\Princeton-Departmental-Data\majors"
    )
    minor_programs_dir = (
        r"C:\Users\ethan_haque\Desktop\repos\Princeton-Departmental-Data\certificates"
    )

    setup_logging()
    database = connect_to_db()
    departmental_data_collection = database["departmental_data"]
    departmental_data = get_departmental_data(
        degree_programs_dir, major_programs_dir, minor_programs_dir
    )
    write_departmental_data_to_db(departmental_data_collection, departmental_data)


if __name__ == "__main__":
    main()
