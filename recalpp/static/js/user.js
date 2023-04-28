"use strict";

var User = {
  enrolledCourses: {},
  courseHistory: {},
  courseMeetings: {},

  /**
   * Returns the enrolled courses dictionary
   * @returns {Object} - enrolled courses dictionary
   */
  getEnrolledCourses: function () {
    return User.enrolledCourses;
  },

  /**
   * Returns the course history dictionary
   * @returns {Object} - course history object
   */
  getCourseHistory: function () {
    return User.courseHistory;
  },

  getCourseCount: function () {
    return (
      Object.keys(User.enrolledCourses).length +
      Object.keys(User.courseHistory).length
    );
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
      courseCount: User.getCourseCount(),
      LAs: 0,
      SAs: 0,
      HAs: 0,
      ECs: 0,
      EMs: 0,
      CDs: 0,
      QCRs: 0,
      SELs: 0,
      SENs: 0,
    };

    const courseList = Object.values(User.getEnrolledCourses());
    User.parseForMetrics(courseList, metrics);

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
  /**
   * Returns the course meetings dictionary
   * @returns {Object} - course meetings dictionary
   */
  getCourseMeetings: function () {
    return User.courseMeetings;
  },

  /**
   * Returns the course meetings dictionary for a given course guid
   * @param {string} guid - course guid
   * @returns {Object} - course meetings dictionary
   */
  getCourseMeetingsByGuid: function (guid) {
    return User.courseMeetings[guid];
  },

  /**
   * Adds a course meeting to the course meetings dictionary
   * @param {Object} courseMeeting - course meeting object
   * @param {string} courseGuid - course guid
   * @returns {Object} - course meeting object
   */
  addCourseMeeting: function (courseGuid, courseMeeting) {
    // adds to array if courseGuid already exists
    if (User.courseMeetings.hasOwnProperty(courseGuid)) {
      User.courseMeetings[courseGuid].push(courseMeeting);
    } else {
      User.courseMeetings[courseGuid] = [courseMeeting];
    }
    return courseMeeting;
  },

  /**
   * Removes a course meeting from the course meetings dictionary
   * @param {string} courseGuid - course guid
   * @returns {Object} - course meeting object
   */
  removeCourseMeetings: function (courseGuid) {
    const courseMeetings = User.courseMeetings[courseGuid];
    delete User.courseMeetings[courseGuid];
    return courseMeetings;
  },
};
