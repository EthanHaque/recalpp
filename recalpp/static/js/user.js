"use strict";

var User = {
  enrolledCourses: [],
  courseHistory: [],
  /**
   * Returns the enrolled courses Array
   * @returns {Array} - enrolled courses Array
   */
  getEnrolledCourses: function () {
    return User.enrolledCourses;
  },
  /**
   * Returns the course history array
   * @returns {Array} - course history array
   */
  getCourseHistory: function () {
    return User.courseHistory;
  },
  /**
   * Adds a course to the enrolled courses set
   * @param {Object} course - course object
   */
  addToEnrolledCourses: function (course) {
    User.enrolledCourses.push(course);
  },
  
};
