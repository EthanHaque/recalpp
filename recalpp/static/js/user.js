"use strict";

var User = {
  enrolledCourses: [],
  courseHistory: [],
  metrics: {},
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
  getMetrics: function () {
    User.generateMetrics();
    return User.metrics;
  },
  generateMetrics: function () {
    User.parseForMetrics(User.getCourseHistory().concat(User.getEnrolledCourses()));
  },
  parseForMetrics: function (courseList) {
    allMetrics = {}
    for (const course of courseList) {
      let courseMetrics = User.parseCourseForMetrics(course);
      for (const metric in courseMetrics) {
        allMetrics[metric] += courseMetrics[metric];
      }
    }
    User.metrics = allMetrics;
  },
  parseCourseForMetrics: function (course) {
    const metrics = {};

    if (distributions.has(course.distribution_areas)) {
      metrics[course.distribution_areas + "s"] += 1;
    }

    return metrics;
  }
};
