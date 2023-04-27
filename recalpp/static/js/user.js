"use strict";

var User = {
  enrolledCourses: [],
  /**
   * Returns the enrolled courses set
   * @returns {Set} - enrolled courses set
   */
  getEnrolledCourses: function () {
    return User.enrolledCourses;
  },
  /**
   * Adds a course to the enrolled courses set
   * @param {Object} course - course object
   */
  addToEnrolledCourses: function (course) {
    User.enrolledCourses.push(course);
  },
};
