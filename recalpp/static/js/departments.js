"use strict";

/**
 * Returns prereqsMet object containing department courses satisfied by user
 * @param {Object} prereqCourses - department prerequisite courses object
 * @return {Object} - prereqsMet object
 */
function getPrereqsMet(prereqCourses) {
  const courseHistory = User.getCourseHistory();
  const enrolledCourses = User.getEnrolledCourses();
  const prereqsMet = {};

  storeCourseIntersection(courseHistory, prereqCourses, prereqsMet);
  storeCourseIntersection(enrolledCourses, prereqCourses, prereqsMet);

  return prereqsMet;
}

/**
 * Updates prereqsMet with courses in both registeredCourses and prereqCourses
 * @param {Object} registeredCourses - registered courses object
 * @param {Object} prereqCourses - department prerequisite courses object
 * @param {Object} prereqsMet - prereqsMet object
 */
function storeCourseIntersection(registeredCourses, prereqCourses, prereqsMet) {
  // Adds courses to prereqsMet if they are in registeredCourses and prereqCourses
  Object.keys(registeredCourses).forEach(function (courseId) {
    if (courseId in prereqCourses) {
      prereqsMet[courseId] = registeredCourses[courseId];
    }
  });
}
