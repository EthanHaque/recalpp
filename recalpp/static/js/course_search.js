"use strict";

/**
 * Initializes Course Search Event Listener
 */
function init() {
  $("#course-search").on("input", handleCourseSearch);
  $.getJSON("/api/v1/current_term", function (data) {
    window.currentTerm = data.current_term;
  });

  $.getJSON("/api/v1/subject_codes", function (data) {
    window.subjectCodes = new Set(data.subject_codes);
  });

  $.getJSON("/api/v1/distributions", function (data) {
    window.distributions = new Set(data.distributions);
  });
}

$(document).ready(init);

/**
 * Handles Course Search Input Event
 * @param {Event} event - input event object
 */
function handleCourseSearch(event) {
  const search = $(event.target).val().trim();

  if (search.length) {
    getCourses(search, updateCourses);
  } else {
    updateCourses([]);
  }
}

/**
 * Retrieves and Parses Course Search String
 * @param {string} search - search string to be parsed
 */
function parseSearchString(search) {
  // Tokenizing the search string
  let tokens = search.split(" ");

  // Initializing search queries object
  let parsedSearch = {
    distributions: [],
    courseNumbers: [],
    subjectCodes: [],
    titleTerms: [],
  };

  // Classifying each token as a search query
  for (const token of tokens) {
    classifyQuery(token, parsedSearch);
  }

  return parsedSearch;
}

/**
 * Classifies Token and Updates parsedSearch Object
 * @param {string} token - token to be classified
 * @param {object} parsedSearch - object containing search
 */
function classifyQuery(token, parsedSearch) {
  token = token.toUpperCase();

  // Tests if Query is a Subject Code
  if (subjectCodes.has(token)) {
    parsedSearch["subjectCodes"].push(token);
    return;
  }

  // Tests if Query is a Course Number
  if (/^\d{1,3}/.test(token)) {
    parsedSearch["courseNumbers"].push(token);
    return;
  }

  // Tests if Query is a Distribution
  if (distributions.has(token)) {
    parsedSearch["distributions"].push(token);
    return;
  }

  // Tests if Query is of form "COS333"
  if (/^[A-Z]{3}/.test(token) && /\d{1,3}$/.test(token)) {
    parsedSearch["subjectCodes"].push(token.match(/^[A-Z]{3}/)[0]);
    parsedSearch["courseNumbers"].push(token.match(/\d{1,3}$/)[0]);
    return;
  }

  // Query is likely a Title Term
  parsedSearch["titleTerms"].push(token);
}

/**
 * Retrieves courses from the API based on the search query
 * @param {string} search - input search query string
 * @param {function} callback - function to process the data
 */
function getCourses(search, callback) {
  const parsedSearch = parseSearchString(search);

  const query = {
    term_code: currentTerm,
  };

  if (parsedSearch.courseNumbers.length) {
    query.catalog_number = parsedSearch.courseNumbers.join(",");
  }

  if (parsedSearch.subjectCodes.length) {
    query.subject_code = parsedSearch.subjectCodes.join(",");
  }

  if (parsedSearch.titleTerms.length) {
    query.title = parsedSearch.titleTerms.join(",");
  }

  if (parsedSearch.distributions.length) {
    query.distribution = parsedSearch.distributions.join(",");
  }

  $.getJSON("/api/v1/courses", { term_code: currentTerm, ...query }, callback);
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
            <div class="flex flex-row justify-between">
              <div class="flex-initial w-64">
                ${course.crosslistings_string}
              </div>
              <div class="text-right">
                ${course.distribution_areas}
             </div>
             </div>
           </div>
           <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
             ${course.title}
           </div>
         </div>
         <button class="w-1/12 bg-indigo-500 text-white font-semibold text-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-75 add-to-calendar" data-course='${JSON.stringify(
           {
             catalog_number: course.catalog_number,
             distribution_areas: course.distribution_areas,
             guid: course.guid,
             title: course.title,
             crosslistings_string: course.crosslistings_string,
             subject_code: course.subject_code,
             term_name: course.term_name,
             term_code: course.term_code,
           }
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
    User.addToEnrolledCourses(course);
    updateEnrolledCourses();
    displayMetrics();
    addCourseToCalendar(course);
  });
}
