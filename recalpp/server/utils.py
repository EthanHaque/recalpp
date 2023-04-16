#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Utility functions accessable to all modules."""

import logging
import urllib.parse
import os
import requests
import base64

import pymongo
import pymongo.errors as mongo_err
import dotenv

# dotenv.load_dotenv("./config/.env")
dotenv.load_dotenv("/etc/secrets/.env") # For production

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

def get_departmental_data_collection() -> pymongo.collection.Collection:
    """Get the departmental data collection.

    Returns
    -------
    collection : pymongo.collection.Collection
        The departmental data collection.
    """
    db_handle = get_db_handle()
    # db_name = os.getenv("DB_NAME") # TODO add this as a env variable
    db_collection = db_handle["recalpp"]["departmental_data"]

    if db_collection:
        logging.info("Successfully retrieved departmental data collection.")
    else:
        logging.error("Failed to retrieve departmental data collection.")

    return db_collection

def get_courses_data_collection() -> pymongo.collection.Collection:
    """Get the courses data collection.

    Returns
    -------
    collection : pymongo.collection.Collection
        The courses data collection.
    """
    db_handle = get_db_handle()
    # db_name = os.getenv("DB_NAME") # TODO add this as a env variable
    db_collection = db_handle["recalpp"]["courses"]

    if db_collection:
        logging.info("Successfully retrieved courses data collection.")
    else:
        logging.error("Failed to retrieve courses data collection.")

    return db_collection


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

def generate_studnet_app_access_token() -> str:
    """Generate a student app access token.

    Returns
    -------
    access_token : str
        The student app access token.
    """
    consumer_secret = os.getenv("STUDENT_APP_CONSUMER_SECRET")
    consumer_key = os.getenv("STUDENT_APP_CONSUMER_KEY")
    token_url = "https://api.princeton.edu:443/token"
    req = requests.post(
        token_url,
        data={"grant_type": "client_credentials"},
        headers={
            "Authorization": "Basic " 
            + base64.b64encode(
                bytes(consumer_key + ":" + consumer_secret, "utf-8")
            ).decode("utf-8")
        },
        timeout=10
    )
    if req.status_code == 200:
        access_token = req.json()["access_token"]
        logging.info("Successfully generated student app access token.")
        return access_token
    else:
        logging.error("Failed to generate student app access token.")
        return None