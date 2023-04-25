import {addCourseToCalendar} from './calendar_functionality.js';

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
   //  const search = parseSearch($(event.target).val().trim());

   const search = $(event.target).val().trim();
   if (search.length) {
     getCourses(search, updateCourses);
   } else {
     updateCourses([]);
   }

 }

// /**
//  * Retrieves and Parses Course Search String
//  * @param {string} search - search string to be parsed
//  */
// function parseSearch(search) {
//   // Tokenizing the search string
//   let tokens = search.split(" ")

//   queries = {"distributions": [],
//   "courseNumber": "", "subjectCode": ""}
//   for (const query of tokens) {
//     classifyQuery(query, queries)
//   }

// }

// /**
//  * Classifies Query 
//  * @param {string} query - query to be classified
//  */
// function classifyQuery(query, queries) {
//   distributions = new Set(["CD", "EC", "EM",
//                            "HA", "LA", "SA", 
//                            "QCR", "SEL","SEN"])

//   subjectCodes = new Set([])
  
//   query = query.toUpperCase()
//   if (distributions.has(query)) {
//     queries['distributions'].push(query)
//     return
//   }
  
//   if (subjectCodes.has(query)) {
//     queries['subjectCode'] = query
//     return
//   }

//   if (query)
// }

 /**
 * Retrieves courses from the API based on the search query
 * @param {string} search - search query
 * @param {function} callback - function to process the data
 */
function getCourses(search, callback) {
   $.getJSON("/api/v1/courses", { search: search }, callback);
 }
 
 /**
 * Updates the course list based on the given data
 * @param {Array} courses - array of course objects
 */
function updateCourses(courses) {
   const courseList = courses
     .map(
       (course) => `
       <li class="group border-solid border-b flex items-center justify-between">
         <div class="block w-11/12 h-max">
           <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
             ${course.crosslistings_string}
           </div>
           <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
             ${course.title}
           </div>
         </div>
         <button class="w-1/12 bg-indigo-500 text-white font-semibold text-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-75 add-to-calendar" data-course='${JSON.stringify(
           course
         )}'>
           +
         </button>
       </li>
     `
     )
     .join("");
 
   $("#courses").html(courseList);
 
   // Add click event listener for the add-to-calendar buttons
   $(".add-to-calendar").on("click", function (event) {
     const course = $(this).data().course;
     addCourseToCalendar(course);
   });
 }