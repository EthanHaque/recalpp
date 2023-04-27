"use strict";

var enrolledCourses = new Set();

/**
 * Adds a course to the enrolled courses set
 * @param {Object} course - course object
 */
function addToEnrolledCourses(course) {
  enrolledCourses.add(course);
  console.log(enrolledCourses);
}