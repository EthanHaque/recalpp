"use strict";

var User = {
  enrolledCourses: {},
  courseMeetings: {},

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
