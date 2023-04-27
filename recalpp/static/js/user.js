"use strict";

var User = {
  enrolledCourses: [],
  courseHistory: [],
  metrics: { LAs: 0, SAs: 0, HAs: 0, ECs: 0, EMs: 0 },
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
    User.parseForMetrics(
      User.getCourseHistory().concat(User.getEnrolledCourses())
    );
  },
  parseForMetrics: function (courseList) {
    for (const course of courseList) {
      let courseMetrics = User.parseCourseForMetrics(course);
      console.log(courseMetrics);
      for (const metric in courseMetrics) {
        if (User.metrics.hasOwnProperty(metric)) {
          User.metrics[metric] += courseMetrics[metric];
        } else {
          User.metrics[metric] = courseMetrics[metric];
        }
      }
    }
    console.log(User.metrics);
  },
  parseCourseForMetrics: function (course) {
    const metrics = {};

    if (distributions.has(course.distribution_areas)) {
      let distribution = course.distribution_areas + "s";
      if (metrics.hasOwnProperty(distribution)) {
        metrics[course.distribution_areas + "s"] += 1;
      } else {
        metrics[course.distribution_areas + "s"] = 1;
      }
    }

    return metrics;
  },
};
