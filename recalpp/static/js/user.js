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
  /**
   * Returns the metrics object
   * @returns {Object} - metrics object
   */
  getMetrics: function () {
    const metrics = User.generateMetrics();
    return metrics;
  },
  /** Generates the metrics object
   * @returns {Object} - metrics object
   */
  generateMetrics: function () {
    const metrics = {
      LAs: 0,
      SAs: 0,
      HAs: 0,
      ECs: 0,
      EMs: 0,
      CDs: 0,
      QCRs: 0,
    };

    const courseList = User.getCourseHistory().concat(User.getEnrolledCourses())
    User.parseForMetrics(
      courseList, metrics
    );

    return metrics;
  },
  /**
   * Parses the course list and updates metrics object
   * @param {Array} courseList - course list
   * @param {Object} metrics - metrics object
   */
  parseForMetrics: function (courseList, metrics) {
    for (const course of courseList) {
      User.parseCourseForMetrics(course, metrics);
    }
  },
  /**
   * Parses a course and updates metrics object
   * @param {Object} course - course object
   * @param {Object} metrics - metrics object
   */
  parseCourseForMetrics: function (course, metrics) {
    const distribution = course.distribution_areas.slice(0, 2).toUpperCase();
    if (distributions.has(distribution)) {
      if (metrics.hasOwnProperty(distribution + "s")) {
        metrics[distribution + "s"] += 1;
      } else {
        metrics[distribution + "s"] = 1;
      }
    }
  },
};
