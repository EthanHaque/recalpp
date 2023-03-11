"""Populate the database with departmental data."""

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import urllib.parse
import logging

import pymongo
import pymongo.errors as mongo_err
import yaml


def connect_to_db():
    """Connect to the MongoDB database.

    Returns:
        db (pymongo.database.Database): The database object.
    """
    db_credentials = get_db_credentials()
    username = urllib.parse.quote_plus(db_credentials["username"])
    password = urllib.parse.quote_plus(db_credentials["password"])
    db_name = urllib.parse.quote_plus(db_credentials["database"])

    try:
        client = pymongo.MongoClient(
            f"mongodb+srv://{username}:{password}@{db_name}/?retryWrites=true&w=majority"
        )
        client.admin.command("ping")
        logging.info("Ping to the database successful.")
    except mongo_err.ConnectionFailure as exc:
        logging.error(exc)
        raise exc

    if client:
        logging.info("Connected to the database.")
    else:
        logging.error("Failed to connect to the database.")
        raise mongo_err.ConnectionFailure("Failed to connect to the database.")

    return client


def get_db_credentials():
    """Get the database credentials.

    Returns:
        db_credentials (dict): The database credentials.
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


def main():
    r"""Main function."""
    setup_logging()
    db = connect_to_db()


if __name__ == "__main__":
    main()
