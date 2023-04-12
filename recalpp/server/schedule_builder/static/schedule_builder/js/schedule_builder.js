"use strict";

/**
 * Initializes event listeners and retrieves degree progress data
 */
function init() {
  $("#course-search").on("input", handleCourseSearch);
  $("#major-search").on("input", handleMajorSearch); // TODO: change this to a dropdown or something simliar 
}

$(document).ready(init);

/**
 * Handles course search input event
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
 * Handles major search change event
 * @param {Event} event - change event object
 */
function handleMajorSearch(event) {
  const major_code = $(event.target).val().trim();

  if (major_code.length) {
    getDegreeProgress(major_code, displayDegreeProgress);
  } else {
    displayDegreeProgress({});
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

/**
 * Retrieves degree progress data from the API based on the major code
 * @param {string} major_code - major code
 * @param {function} callback - function to process the data
 */
function getDegreeProgress(major_code, callback) {
  $.getJSON("/api/v1/majors", { major_code: major_code }, callback);
}

/**
 * Updates the course list based on the given data
 * @param {Array} courses - array of course objects
 */
function updateCourses(courses) {
  const courseList = courses
    .map(
      (course) => `
      <li>
        <a class="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300" href="">
          ${course.crosslistings}
          <br />
          ${course.long_title}
        </a>
      </li>
    `
    )
    .join("");

  $("#courses").html(courseList);
}

/**
 * Displays degree progress data
 * @param {Object} data - degree progress data
 */
function displayDegreeProgress(data) {
  const degreeProgressContainer = $("#degree-progress-content");
  let degreeProgressHtml = buildDegreeProgressHtml(data);
  console.log(degreeProgressHtml);
  degreeProgressContainer.html(degreeProgressHtml);
}

/**
 * Builds degree progress HTML based on the given data
 * @param {Object} data - degree progress data
 * @return {string} - generated HTML
 */
function buildDegreeProgressHtml(data) {
  const reqListHtml = data.req_list.map(buildReqHtml).join("");
  return `
    <h2 class="text-xl font-semibold mb-4">${data.type}: ${data.name} (${data.code})</h2>
    <h3 class="text-lg font-semibold mb-2">Requirements:</h3>
    ${reqListHtml}
  `;
}

/**
 * Builds requirement HTML based on the given data
 * @param {Object} req - requirement data
 * @return {string} - generated HTML
 */
function buildReqHtml(req) {
  const subReqHtml = req.req_list
    ? req.req_list.map(buildSubReqHtml).join("")
    : "";
  return `
    <div class="mb-4">
      <h4 class="text-md font-semibold">${req.name}</h4>
      <p>${req.explanation}</p>
      ${subReqHtml}
    </div>
  `;
}

/**
 * Builds sub-requirement HTML based on the given data
 * @param {Object} subReq - sub-requirement data
 * @return {string} - generated HTML
 */
function buildSubReqHtml(subReq) {
  const courseListHtml = subReq.course_list
    ? subReq.course_list.map((course) => `<li>${course}</li>`).join("")
    : "";

  return `
    <div class="ml-4 mb-2">
      {" "}
      <h5 class="text-sm font-semibold">${subReq.name}</h5>{" "}
      <ul> ${courseListHtml} </ul>{" "}
    </div>
  `;
}
