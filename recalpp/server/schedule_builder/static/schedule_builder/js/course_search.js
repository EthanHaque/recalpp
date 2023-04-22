"use strict";

/**
 * Initializes Course Search Event Listener
 */
function init() {
  $("#course-search").on("input", handleCourseSearch);
}

$(document).ready(init);

/**
 * Handles Course Search Input Event
 * @param {Event} event - input event object
 */
function handleCourseSearch(event) {
   // retrieve and process (trim) input string
   const search = $(event.target).val().trim();

   if (search.length) {
     getCourses(search, updateCourses);
   } else {
     updateCourses([]);
   }

 }

 /**
 * Retrieves courses from the API based on the search query
 * @param {string} search - search query
 * @param {function} callback - function to process the data
 */
function getCourses(search, callback) {
   $.getJSON("/api/v1/courses", { search: search }, callback);
 }
 