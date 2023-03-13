#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Helper for connecting to the database."""

import logging
import urllib.parse

import pymongo
import pymongo.errors as mongo_err
import yaml


def connect_to_db() -> pymongo.MongoClient:
    """Connect to the database via client.

    Returns
    -------
    client : pymongo.MongoClient
        The database client.
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

    return client


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