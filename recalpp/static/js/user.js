"use strict";

var User = {
  enrolledCourses: {},

  /**
   * Returns the enrolled courses dictionary
   * @returns {Object} - enrolled courses dictionary
   */
  getEnrolledCourses: function () {
    return User.enrolledCourses;
  },

  /**
   * Adds a course to the enrolled courses dictionary
   * @param {Object} course - course object
   */
  addToEnrolledCourses: function (course) {
    User.enrolledCourses[course.guid] = course;
  },

  /**
   * Removes a course from the enrolled courses dictionary
   * @param {string} guid - course guid
   * @returns {Object} - course object
   */
  removeFromEnrolledCourses: function (guid) {
    const course = User.enrolledCourses[guid];
    delete User.enrolledCourses[guid];
    return course;
  },

  /**
   * Checks if a course is in the enrolled courses dictionary
   * @param {Object} course - course object
   * @returns {boolean} - true if course is in the enrolled courses dictionary
   */
  IsEnrolledInCourse: function (course) {
    return User.enrolledCourses.hasOwnProperty(course.guid);
  },
};
