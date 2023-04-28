"use strict";

/* Finds the intersection of courseHistory courses and department prerequisites
 * @param {Object} prereqCourses - Object of department prerequisite courses
 * @return {Object} - Object of courses in courseHistory that are also in prereqCourses
 */
function getPrerequisitesMet(prereqCourses) {
   const courseHistory = User.getCourseHistory();
   const enrolledCourses = User.getEnrolledCourses();
   const prereqsMet = {};

   storeCourseIntersection(courseHistory, prereqCourses, prereqsMet);
   storeCourseIntersection(enrolledCourses, prereqCourses, prereqsMet);

   return prereqsMet;
}

/* Adds courses to prereqsMet if they are in registeredCourses and prereqCourses
 * @param {Object} registeredCourses - Object of registered courses
 * @param {Object} prereqCourses - Object of department prerequisite courses
 * @param {Object} prereqsMet - Object of courses in registeredCourses that are also in prereqCourses
 */
function storeCourseIntersection(registeredCourses, prereqCourses, prereqsMet) {

   // Adds courses to prereqsMet if they are in registeredCourses and prereqCourses
   Object.keys(registeredCourses).forEach(function (courseId) {
      if (courseId in prereqCourses) {
         prereqsMet[courseId] = registeredCourses[courseId];
      }
   });

}