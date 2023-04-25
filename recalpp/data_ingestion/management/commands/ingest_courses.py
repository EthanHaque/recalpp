"""
This script provides a Django management command `ingest_courses` to ingest course data from the
Princeton Student API and store it into the PostgreSQL database using Django ORM.
"""
from django.core.management.base import BaseCommand
from recalpp.data_ingestion.models import (
    Course, Instructor, CourseInstructor, CrossListing, Class,  Meeting
)
import json
import logging
import requests
from datetime import datetime


logger = logging.getLogger(__name__)

class Command(BaseCommand):
    """
    A custom Django management command to ingest course data from the Princeton
    API into the PostgreSQL database.

    Attributes
    ----------
    help : str
        A brief description of the command.

    Methods
    -------
    generate_student_app_access_token():
        Generates an access token for the Princeton API.
    save_instructors(course, instructors_data):
        Saves instructor data associated with a course.
    save_crosslistings(course, crosslistings_data):
        Saves crosslisting data associated with a course.
    save_classes_and_meetings(course, classes_data):
        Saves class and meeting data associated with a course.
    save_course_data(course_data, term_code, term_name, subject_code):
        Saves course data and its related data to the database.
    convert_time(time):
        Converts a time string into a datetime object.
    add_arguments(parser):
        Adds command line arguments for the script.
    handle(*args, **options):
        Main function that handles the process of data ingestion.
    """
    help = "Ingest data from API into PostgreSQL database"

    def save_instructors(self, course, instructors_data):
        """
        Saves instructor data associated with a course.

        Parameters
        ----------
        course : Course
            The Course instance to associate with the instructors.
        instructors_data : list
            A list of dictionaries containing instructor data.
        """
        for instructor_data in instructors_data:
            instructor, _ = Instructor.objects.get_or_create(
                emplid=instructor_data["emplid"],
                defaults={
                    "first_name": instructor_data["first_name"],
                    "last_name": instructor_data["last_name"],
                    "full_name": instructor_data["full_name"]
                }
            )

            CourseInstructor.objects.create(
                course=course,
                instructor=instructor
            )

    def save_crosslistings(self, course, crosslistings_data):
        """
        Saves crosslisting data associated with a course.

        Parameters
        ----------
        course : Course
            The Course instance to associate with the crosslistings.
        crosslistings_data : list
            A list of dictionaries containing crosslisting data.
        """
        for crosslisting_data in crosslistings_data:
            CrossListing.objects.create(
                course=course,
                subject=crosslisting_data["subject"],
                catalog_number=crosslisting_data["catalog_number"]
            )

    def save_classes_and_meetings(self, course, classes_data):
        """
        Saves class and meeting data associated with a course.

        Parameters
        ----------
        course : Course
            The Course instance to associate with the classes and meetings.
        classes_data : list
            A list of dictionaries containing class data.
        """
        for class_data in classes_data:
            class_obj = Class.objects.create(
                course=course,
                class_number=class_data["class_number"],
                section=class_data["section"],
                status=class_data["status"],
                pu_calc_status=class_data["pu_calc_status"],
                seat_status=class_data["seat_status"],
                type_name=class_data["type_name"],
                capacity=class_data["capacity"],
                enrollment=class_data["enrollment"]
            )

            start_date = class_data["schedule"]["start_date"]
            end_date = class_data["schedule"]["end_date"]

            for meeting_data in class_data["schedule"]["meetings"]:
                start_time = self.convert_time(meeting_data["start_time"])
                end_time = self.convert_time(meeting_data["end_time"])
                Meeting.objects.create(
                    class_obj=class_obj,
                    start_date=start_date,
                    end_date=end_date,
                    meeting_number=meeting_data["meeting_number"],
                    start_time=start_time,
                    end_time=end_time,
                    days=meeting_data["days"],
                )

    def save_course_data(self, course_data, course_details, term_code, term_name, subject_code):
        """
        Saves course data and its related data to the database.

        Parameters
        ----------
        course_data : dict
            A dictionary containing course data.
        course_details : dict
            A dictionary containing course detail data.
        term_code : str
            The term code associated with the course.
        term_name : str
            The term name associated with the course.
        subject_code : str
            The subject code associated with the course.

        Returns
        -------
        Course
            The created or retrieved Course instance.
        """
        distribution_areas = course_details["course_details"]["course_detail"]["distribution_area_short"]
        if distribution_areas is None:
            distribution_areas = ""

        course_details = course_details["course_details"]["course_detail"]["crosslistings"] 
        if course_details is None:
            course_details = ""
        
        course, created = Course.objects.get_or_create(
            guid=course_data["guid"],
            defaults={
                "course_id": course_data["course_id"],
                "catalog_number": course_data["catalog_number"],
                "title": course_data["title"],
                "start_date": course_data["detail"]["start_date"],
                "end_date": course_data["detail"]["end_date"],
                "track": course_data["detail"]["track"],
                "description": course_data["detail"]["description"],
                "seat_reservations": course_data["detail"]["seat_reservations"],
                "term_code": term_code,
                "term_name": term_name,
                "subject_code": subject_code,
                "distribution_areas": distribution_areas,
                "crosslistings_string": course_details
            }
        )

        if created:
            self.save_instructors(course, course_data["instructors"])
            self.save_crosslistings(course, course_data["crosslistings"])
            self.save_classes_and_meetings(course, course_data["classes"])

        return course

    
    def convert_time(self, time):
        """
        Converts a time string into a datetime object.

        Parameters
        ----------
        time : str
            A time string in the format "I:%M %p".

        Returns
        -------
        datetime
            A datetime object representing the input time.
        """
        return datetime.strptime(time, "%I:%M %p")


    def add_arguments(self, parser):
        """
        Adds command line arguments for the script.

        Parameters
        ----------
        parser : ArgumentParser
            The ArgumentParser instance to which the arguments will be added.
        """
        parser.add_argument("term", type=str, help="Term code for courses")
        parser.add_argument("course_code", type=str, help="Course code for courses")
        parser.add_argument("api_key", type=str, help="API key for Princeton Student App")
    
    def get_course_information(self, token, term, course_code, session):
        """
        Fetches course information from the Princeton Student App API.
        
        Parameters
        ----------
        token : str
            The API key for the Princeton Student App.
        term : str
            The term code for the courses.
        course_code : str
            The course code for the courses.
        session : Session
            The Session instance to use for the request.
        
        Returns
        -------
        dict
            A dictionary containing course information.
        """
        course_url = f"https://api.princeton.edu:443/student-app/1.0.2/courses/courses?term={term}&subject={course_code}&fmt=json"
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = session.get(course_url, headers=headers, timeout=120)
        
        if response.status_code == 200:
            data = json.loads(response.text)
            return data
        else:
            logger.error(f"Error fetching data from courses API: {response.status_code}")
            return None
        

    def get_course_details(self, token, term, session, course_id):
        """
        Fetches course details from the Princeton Student App API.

        Parameters
        ----------
        token : str
            The API key for the Princeton Student App.
        term : str
            The term code for the courses.
        session : Session
            The Session instance to use for the request.
        course_id : str
            The course ID for the courses.

        Returns
        -------
        dict
            A dictionary containing course details.
        """
        course_details_url = f"https://api.princeton.edu:443/student-app/1.0.2/courses/details?term={term}&course_id={course_id}&fmt=json"
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = session.get(course_details_url, headers=headers, timeout=120)

        if response.status_code == 200:
            course_details = json.loads(response.text)
            return course_details
        else:
            logger.error(f"Error fetching data from course detail API: {response.status_code}")
            return None


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
        token = options["api_key"]
        term = options["term"]
        course_code = options["course_code"]
        session = requests.Session()
        
        data = self.get_course_information(token, term, course_code, session)

        if not data:
            logger.error("No data found for the given term %s and subject %s", term, course_code)
            return

        for response_term in data["term"]:
            if response_term["code"]:
                term_code = response_term["code"]
                term_name = response_term["name"]

                for subject in response_term["subjects"]:
                    subject_code = subject["code"]
                    courses = subject["courses"]
                    
                    for course_data in courses:
                        course_id = course_data["course_id"]
                        course_details = self.get_course_details(token, term_code, session, course_id)

                        if not course_details:
                            logger.error("No data for for course %s for term %s", course_id, term_code)
                            continue
                        
                        self.save_course_data(course_data, course_details, term_code, term_name, subject_code)

                    output_string = f"Data ingested successfully for {term_code} {subject_code}"
                    self.stdout.write(self.style.SUCCESS(output_string))
            else:
                logger.info("No data found for the given term %s and subject %s", term, course_code)


            
                