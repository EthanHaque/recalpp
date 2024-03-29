"use strict";

var User = {
  enrolledCourses: {},
  courseHistory: {},
  courseMeetings: {},
  relevantCourses: {},
  notes: "",
  major: "",

  /**
   * Gets the user major
   */
  getMajor: function () {
    return User.major;
  },

  /**
   * Sets the user major and updates the relevant courses
   * @param {string} major - user major
   */
  setMajor: function (major) {
    User.major = major;
    User.saveUserProfile();
  },

  /**
   * Updates the relevant courses
   */
  updateRelevantCourses: function () {
    const major = User.getMajor();
    const route = `/api/v1/required_courses/?major=${major}`;
    return $.getJSON(route)
      .then(function (data) {
        const courses = {};
        data.forEach(function (course) {
          courses[course.course.guid] = course.course;
        });
        return courses;
      })
      .fail(function (jqxhr, textStatus, error) {
        console.log("Request Failed: " + textStatus + ", " + error);
      });
  },

  setRelevantCourses: function (courses) { 
    User.relevantCourses = courses;
  },

  /**
   * Returns the course count of User
   * @returns {number} - course count
   */
  getCourseCount: function () {
    return (
      Object.keys(User.enrolledCourses).length +
      Object.keys(User.courseHistory).length
    );
  },

  /**
   * Returns the enrolled courses dictionary
   * @returns {Object} - enrolled courses dictionary
   */
  getEnrolledCourses: function () {
    return User.enrolledCourses;
  },

  /**
   * Returns the enrolled courses count of User
   * @returns {number} - enrolled courses count
   */
  getEnrolledCoursesCount: function () {
    return Object.keys(User.enrolledCourses).length;
  },

  /**
   * Checks if a course is in the enrolled courses dictionary
   * @param {Object} course - course object
   * @returns {boolean} - true if course is in the enrolled courses dictionary
   */
  isEnrolledInCourse: function (course) {
    return User.enrolledCourses.hasOwnProperty(course.guid);
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
  removeFromEnrolledCourses: function (guid, save = true) {
    const course = User.enrolledCourses[guid];
    delete User.enrolledCourses[guid];
    if (save) User.saveUserProfile();
    return course;
  },

  /**
   * Returns the course history dictionary
   * @returns {Object} - course history dictionary where key is course guid and value is course object.
   */
  getCourseHistory: function () {
    return User.courseHistory;
  },

  /**
   * Returns the course history count of User.
   * @param {Object} courseHistory - course history dictionary
   */
  setCourseHistory: function (courseHistory, save = true) {
    User.courseHistory = courseHistory;
    if (save) User.saveUserProfile();
  },

  /**
   * Returns the metrics object
   * @returns {Object} - metrics object
   */
  getMetrics: function () {
    const metrics = User.generateMetrics();
    return metrics;
  },

  /**
   * Generates the metrics object
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

    let courseList = Object.values(User.getEnrolledCourses());
    courseList = courseList.concat(Object.values(User.getCourseHistory()));
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
    // Extracting distribution areas from course object
    const courseDistributions = course.distribution_areas
      .toUpperCase()
      .split(" OR ");

    for (const distribution of courseDistributions) {
      if (distributions.has(distribution)) {
        if (metrics.hasOwnProperty(distribution + "s")) {
          metrics[distribution + "s"] += 1;
        }
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
  removeCourseMeeting: function (courseGuid, save = true) {
    const courseMeetings = User.courseMeetings[courseGuid];
    delete User.courseMeetings[courseGuid];
    if (save) User.saveUserProfile();
    return courseMeetings;
  },

  /**
   * Returns the notes of User
   * @returns {string} - notes
   */
  getNotes: function () {
    return User.notes;
  },

  /**
   * Sets the notes of User
   * @param {string} noteText - notes string
   */
  setNotes: function (notesText, save = true) {
    User.notes = notesText;
    if (save) User.saveUserProfile();
  },

  /**
   * Saves the user profile to the database
   */
  saveUserProfile: function () {
    $.post("/api/v1/save_user_profile/", {
      user_data: JSON.stringify(User),
      csrfmiddlewaretoken: User.getCookie("csrftoken"),
    }).done(function (data) {
      if (data.status === "success") {
        console.log("User profile saved successfully");
      } else {
        console.log("Failed to save user profile");
      }
    });
  },

  /**
   * Utility function to get CSRF token from cookies
   * @param {string} name - cookie name
   * @returns {string} - cookie value
   */
  getCookie: function (name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  },

  /**
   * Loads the user profile from the database
   * @returns {Object} - user profile object
   */
  getUserProfile: function () {
    $.get("/api/v1/get_user_profile/")
      .done(function (data) {
        User.enrolledCourses = data.enrolledCourses;
        User.courseHistory = data.courseHistory;
        User.courseMeetings = data.courseMeetings;
        User.notes = data.notes;
        User.major = data.major;
        User.updateRelevantCourses().then(function (courses) {
          User.relevantCourses = courses;
          User.saveUserProfile();
          setUserNotes();
          init_combobox();
          addStoredUserCoursesToCalendar();
          displayMetrics();
        });
        console.log("User profile loaded successfully");
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("Failed to load user profile:", textStatus, errorThrown);
      });
  },

  /**
   * Resets the user profile
   */
  resetUserProfile: function () {
    User.enrolledCourses = {};
    User.courseHistory = {};
    User.courseMeetings = {};
    User.notes = "";
    User.major = "";
    User.saveUserProfile();
  },

  /**
   * Gets the courses relevant to the user
   * @returns {Object} - courses relevant to the user
   */
  getRelevantCourses: function () {
    return User.relevantCourses;
  },
};

/**
 * Displays the metrics on the profile page
 */
function userInit() {
  User.getUserProfile();
}
