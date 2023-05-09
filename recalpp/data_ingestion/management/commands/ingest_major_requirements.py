"""
This script provides a Django management command `ingest_major_requirements` to ingest 
course requirement data from the Princeton-Departmental-Data repository
and store it into the database.
"""

from django.core.management.base import BaseCommand
from recalpp.data_ingestion.models import Major, RequiredCourse, Course
 
import logging
import yaml
import os

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    """
    A custom Django management command to ingest major requirement data from the
    Princeton-Departmental-Data repository and store it into the database.

    Attributes
    ----------
    help : str
        A short description of the command.

    Methods
    -------
    add_arguments(parser)
        Adds command line arguments to the command.
    handle(*args, **options)
        Main function that handles the process of data ingestion.
    ingest_major_requirements(majors_dir)
        Ingests major requirement data from the Princeton-Departmental-Data repository
        and stores it into the database.
    ingest_single_major_requirement(major_dir, major_name)
        Ingests major requirement data for a single major from the Princeton-Departmental-Data
        repository and stores it into the database.
    """

    def add_arguments(self, parser):
        """
        Adds command line arguments to the command.

        Parameters
        ----------
        parser : argparse.ArgumentParser
            The ArgumentParser instance to which the arguments will be added.
        """
        parser.add_argument("majors_dir", type=str, help="The path to the directory containing the major requirement data.")


    def ingest_major_requirements(self, majors_dir):
        """
        Ingests major requirement data from the Princeton-Departmental-Data repository
        and stores it into the database.
        
        Parameters
        ----------
        majors_dir : str
            The path to the directory containing the major requirement data.
        
        Returns
        -------
        None
        """
        major_data_files = {}
        for f in os.listdir(majors_dir):
            file_path = os.path.join(majors_dir, f)
            if (os.path.isfile(file_path)) and (f.lower().endswith(".yaml")):
                major_name = f[:-5]
                major_data_files[major_name] = file_path
        
        for major_name, major_data_file in major_data_files.items():
            self.ingest_single_major_requirement(major_data_file, major_name)


    def ingest_single_major_requirement(self, major_yaml_file_path, major_name):
        """
        Ingests major requirement data for a single major from the Princeton-Departmental-Data
        repository and stores it into the database.

        Parameters
        ----------
        major_yaml_file_path : str
            The path to the file containing the major requirement data.
        major_name : str
            The name of the major.
        
        Returns
        -------
        None
        """
        with open(major_yaml_file_path, "r", encoding="utf-8") as f:
            major_data = yaml.safe_load(f)

        total_course_set, _ = self._get_collapsed_course_and_dist_req_sets(major_data)
        cleaned_course_set = set()
        for course in total_course_set:
            if "*" in course:
                continue
            if len(course) == 3:
                continue
            if "/" in course:
                course = course.split("/")[0]
                
            cleaned_course_set.add(course)

        major, _ = Major.objects.get_or_create(name=major_name)
        RequiredCourse.objects.filter(major=major).delete()
        for course in cleaned_course_set:
            course_subject_code, course_number = course.strip().split(" ")
            course_in_database = Course.objects.filter(subject_code=course_subject_code, catalog_number=course_number).first()
            if course_in_database:
                RequiredCourse.objects.create(major=major, course=course_in_database)
            
        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {major_name} major requirement data."))

    def _get_collapsed_course_and_dist_req_sets(self, req):
        """
        Extracts the sets of all courses and all distribution requirements
        in the req's subtree as a tuple: (course_set, dist_req_set)

        Note: Sets may contain duplicate courses if a course is listed in multiple
        different ways.

        Parameters
        ----------
        req : dict
            A dictionary representing the requirement data structure.

        Returns
        -------
        tuple
            A tuple containing two sets:
                - course_set: A set of all courses in the req's subtree.
                - dist_req_set: A set of all distribution requirements in the req's subtree.
        """
        course_set = set()
        dist_req_set = set()

        if "course_list" in req:
            for course in req["course_list"]:
                if isinstance(course, dict):
                    course = list(course.keys())[0]
                course_set.add(course.split(':')[0])

        if "dist_req" in req:
            if isinstance(req["dist_req"], list):
                dist_req_set = set(req["dist_req"])
            else:
                dist_req_set.add(req["dist_req"])

        if "req_list" in req:
            for subreq in req["req_list"]:
                sub_course_set, sub_dist_req_set = self._get_collapsed_course_and_dist_req_sets(subreq)
                course_set.update(sub_course_set)
                dist_req_set.update(sub_dist_req_set)

        return course_set, dist_req_set


    

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
        majors_dir = options["majors_dir"]
        self.ingest_major_requirements(majors_dir)