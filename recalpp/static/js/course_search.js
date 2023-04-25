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
    window.subjectCodes = data.subject_codes;
  });

  $.getJSON("/api/v1/distributions", function (data) {
    window.distributions = data.distributions;
  });
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

function parse_search_string(search) {
  search = search.toLowerCase();

  const distributionsRegex = new RegExp(
    `\\b(${distributions.join("|")})\\b`,
    "gi"
  );
  const subjectCodesRegex = new RegExp(
    `\\b(${subjectCodes.join("|")})\\b`,
    "gi"
  );
  const courseNumberRegex = new RegExp(`\\b([0-9]{1,3})\\b`, "gi");
  const courseWithSubjectCodeRegex = new RegExp(
    `\\b(${subjectCodes.join("|")})\\s*([0-9]{1,3})\\b`,
    "gi"
  );
  const courseTitleRegex = new RegExp(`\\b([a-z]+)\\b`, "gi");

  const dists = new Set(search.match(distributionsRegex));
  const codes = new Set(search.match(subjectCodesRegex));
  const courseNumber = new Set(search.match(courseNumberRegex));
  const courseWithSubjectCode = new Set(
    search.match(courseWithSubjectCodeRegex)
  );
  const courseTitles = new Set(search.match(courseTitleRegex));

  // Iterate over the courseWithSubjectCode Set and extract code and course number
  courseWithSubjectCode.forEach((entry) => {
    const codeMatch = entry.match(/[a-z]+/);
    const courseNumberMatch = entry.match(/\d{1,3}/);

    if (codeMatch) {
      codes.add(codeMatch[0]);
    }

    if (courseNumberMatch) {
      courseNumber.add(courseNumberMatch[0]);
    }
  });

  // remove the codes entries from the courseTitles Set
  codes.forEach((code) => {
    courseTitles.delete(code);
  });

  // remove the distributionsRegex entries from the courseTitles Set
  dists.forEach((dist) => {
    courseTitles.delete(dist);
  });

  let parsedSearch = {
    distributions: dists ? Array.from(dists) : [],
    subjectCodes: codes ? Array.from(codes) : [],
    courseNumbers: courseNumber ? Array.from(courseNumber) : [],
    courseTitles: courseTitles ? Array.from(courseTitles) : [],
  };

  return parsedSearch;
}

/**
 * Retrieves courses from the API based on the search query
 * @param {string} search - search query
 * @param {function} callback - function to process the data
 */
function getCourses(search, callback) {
  const parsedSearch = parse_search_string(search);
  const query = {
    term_code: currentTerm,
  };

  if (parsedSearch.courseNumbers.length) {
    query.catalog_number = parsedSearch.courseNumbers.join(",");
  }

  if (parsedSearch.subjectCodes.length) {
    query.subject_code = parsedSearch.subjectCodes.join(",");
  }

  if (parsedSearch.courseTitles.length) {
    query.title = parsedSearch.courseTitles.join(",");
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
           { guid: course.guid }
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
