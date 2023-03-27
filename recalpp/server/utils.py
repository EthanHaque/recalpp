#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Utility functions accessable to all modules."""

import logging
import urllib.parse
import os

import pymongo
import pymongo.errors as mongo_err
import dotenv

dotenv.load_dotenv()

def get_db_handle() -> pymongo.MongoClient:
    """Connect to the database via client.

    Returns
    -------
    client : pymongo.MongoClient
        The database client.
    """
    db_credentials = get_db_credentials()
    
    username = db_credentials["username"]
    password = db_credentials["password"]
    db_name = db_credentials["database"]

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
    # TODO: check .env file exists and was read correctly.

    username = urllib.parse.quote_plus(os.getenv("MONGODB_USERNAME"))
    password = urllib.parse.quote_plus(os.getenv("MONGODB_PASSWORD"))
    db_name = urllib.parse.quote_plus(os.getenv("MONGODB_DATABASE"))

    db_credentials = {
            "username": username,
            "password": password,
            "database": db_name,
        }
    return db_credentials
