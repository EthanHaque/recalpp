"use strict";

var User = {
  enrolledCourses: {},
  courseHistory: [],
  /**
   * Returns the enrolled courses dictionary
   * @returns {Object} - enrolled courses dictionary
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
