"""
Fetch all courses for all terms and department codes specified in the given files.
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command

import base64
import requests

from concurrent.futures import ThreadPoolExecutor, as_completed

import logging
import environ

env = environ.Env()

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    """
    A custom Django management command to fetch all courses for all terms and department codes specified in the given files.

    Attributes
    ----------
    help : str
        A brief description of the command.
    
    Methods
    -------
    read_file(file_path):
        Read a file and return its content as a list of lines.
    fetch_courses(term, code):
        Fetch courses for the given term and department code using the ingest_api_data management command.
    add_arguments(parser):
        Adds command line arguments for the script.
    handle(*args, **options):
        Main function that handles the process of data ingestion.
    """
    help = "Fetch all courses for all terms and department codes specified in the given files."

    def generate_student_app_access_token(self) -> str:
        """
        Generates an access token for the Princeton API.

        Returns
        -------
        str
            Access token string.
        """
        consumer_secret = env("STUDENT_APP_CONSUMER_SECRET")
        consumer_key = env("STUDENT_APP_CONSUMER_KEY")
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
            timeout=300
        )
        if req.status_code == 200:
            access_token = req.json()["access_token"]
            logger.info("Successfully generated student app access token.")
            return access_token
        else:
            logger.error("Failed to generate student app access token.")
            return None

    def read_file(self, file_path):
        """
        Read a file and return its content as a list of lines.

        Parameters
        ----------
        file_path : str
            The path to the file.

        Returns
        -------
        list
            A list containing the lines of the file.
        """
        with open(file_path, 'r') as f:
            return [line.strip() for line in f.readlines()]
        
    def add_arguments(self, parser):
        """
        Add command line arguments for the script.

        Parameters
        ----------
        parser : ArgumentParser
            The parser to add the arguments to.
        """
        parser.add_argument("terms_file", type=str, help="Path to the file containing the term codes.")
        parser.add_argument("department_codes_file", type=str, help="Path to the file containing the department codes.")
        parser.add_argument("--max_workers", type=int, default=10, help="Maximum number of worker threads to use.")


    def handle(self, *args, **options):
        """
        Main function that handles the process of data ingestion.

        Parameters
        ----------
        args : tuple
            Positional arguments passed to the command.
        options : dict
            Keyword arguments passed to the command.
        """
        terms_file = options["terms_file"]
        department_codes_file = options["department_codes_file"]
        max_workers = options["max_workers"]

        api_access_token = self.generate_student_app_access_token()
        if api_access_token is None:
            return

        terms = self.read_file(terms_file)
        department_codes = self.read_file(department_codes_file)

        # Fetch courses concurrently for all terms and department codes
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [
                executor.submit(call_command, "ingest_courses", term, code, api_access_token)
                for term in terms
                for code in department_codes
            ]

            # Process results as they become available
            for future in as_completed(futures):
                future.result()
                

        self.stdout.write(self.style.SUCCESS("Fetched all courses for all terms and department codes."))