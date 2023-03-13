#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Populate the database with course data."""

import requests
import logging
import urllib.parse

import pymongo
import pymongo.errors as mongo_err


