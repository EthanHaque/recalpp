#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Interface to the database to retrieve data for the API."""

import logging

import utils


def get_major_information(major_code: str) -> dict:
    """Get the major information from the database.

    Parameters
    ----------
    major_code : str
        The major code.

    Returns
    -------
    major_info : dict
        The major information.
    """
    logging.info("Getting major information for %s.", major_code)
    db_collection = utils.get_departmental_data_collection()

    major_info = db_collection.find_one({"type": "major", "code": major_code})

    if major_info:
        logging.info("Successfully retrieved major information.")
    else:
        logging.error("Failed to retrieve major information.")

    return major_info