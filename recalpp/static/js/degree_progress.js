"use strict";

/**
 * Initializes event listeners and retrieves degree progress data
 */
function init() {
  $("#major-search").on("input", handleMajorSearch); // TODO: change this to a dropdown or something simliar
  displayMetrics();
}

$(document).ready(init);

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
 * Displays metric data in right sidebar
 */
function displayMetrics() {
  const metrics = User.getMetrics();
  const generalMetricsContainer = $("#general-metrics-content");
  const distributionsMetricsContainer = $("#distribution-metrics-content");
  let generalMetricsHtml = buildGeneralMetricsHtml(metrics);
  let distributionsMetricsHtml = buildDistributionsMetricsHtml(metrics);
  generalMetricsContainer.html(generalMetricsHtml);
  distributionsMetricsContainer.html(distributionsMetricsHtml);
}

/**
 * Builds general metrics HTML based on the given data
 * @param {Object} metrics - metric data
 * @return {string} - generated HTML
 */
function buildGeneralMetricsHtml(metrics) {
  return `<p>Total Course Count: ${metrics.courseCount}</p>`;
}

/**
 * Builds distributions metric HTML based on the given data
 * @param {Object} metrics - metric data
 * @return {string} - generated HTML
 */
function buildDistributionsMetricsHtml(metrics) {
  return `
  <p>LAs Satisfied: ${metrics.LAs} <br>
  SAs Satisfied: ${metrics.SAs} <br>
  HAs Satisfied: ${metrics.HAs} <br>
  ECs Satisfied: ${metrics.ECs} <br>
  EMs Satisfied: ${metrics.EMs} <br>
  CDs Satisfied: ${metrics.CDs} <br>
  QCRs Satisfied: ${metrics.QCRs} <br>
  SELs Satisfied: ${metrics.SELs} <br>
  SENs Satisfied: ${metrics.SENs}</p>`;
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
 * Displays degree progress data
 * @param {Object} data - degree progress data
 */
function displayDegreeProgress(data) {
  const degreeProgressContainer = $("#degree-progress-content");
  let degreeProgressHtml = buildDegreeProgressHtml(data);
  degreeProgressContainer.html(degreeProgressHtml);
}

/**
 * Builds degree progress HTML based on the given data
 * @param {Object} data - degree progress data
 * @return {string} - generated HTML
 */
function buildDegreeProgressHtml(data) {
  let html = ``;

  if (data && data.req_list) {
    const reqListHtml = data.req_list.map(buildReqHtml).join("");
    html += `
       <h2 class="text-xl font-semibold mb-4">${data.type}: ${data.name} (${data.code})</h2>
       <h3 class="text-lg font-semibold mb-2">Requirements:</h3>
       ${reqListHtml}
     `;
  }

  return html;
}

/**
 * Builds requirement HTML based on the given data
 * @param {Object} req - requirement data
 * @return {string} - generated HTML
 */
function buildReqHtml(req) {
  return buildReqOrSubReqHtml(req, "text-md font-semibold", "mb-4");
}

/**
 * Builds sub-requirement HTML based on the given data
 * @param {Object} subReq - sub-requirement data
 * @return {string} - generated HTML
 */
function buildSubReqHtml(subReq) {
  return buildReqOrSubReqHtml(subReq, "text-sm font-semibold", "ml-4 mb-2");
}

/**
 * Builds requirement or sub-requirement HTML based on the given data and CSS classes
 * @param {Object} data - requirement or sub-requirement data
 * @param {string} titleClass - CSS class for the title element
 * @param {string} containerClass - CSS class for the container element
 * @return {string} - generated HTML
 */
function buildReqOrSubReqHtml(data, titleClass, containerClass) {
  const contentHtml = buildContentHtml(data);

  if (data.name) {
    return `
     <div class="${containerClass}">
       <h4 class="${titleClass}">${data.name}</h4>
       <ul>${contentHtml}</ul>
     </div>
   `;
  }

  return `
   <div class="${containerClass}">
     <ul>${contentHtml}</ul>
   </div>
 `;
}

/**
 * Builds content HTML based on the given data
 * @param {Object} data - requirement or sub-requirement data
 * @return {string} - generated HTML
 */
function buildContentHtml(data) {
  if (data.req_list) {
    return data.req_list.map(buildSubReqHtml).join("");
  } else if (data.course_list) {
    return buildCourseListHtml(data.course_list);
  }
  return "";
}

/**
 * Builds course list HTML based on the given data
 * @param {Array} courseList - array of course codes
 * @return {string} - generated HTML
 */
function buildCourseListHtml(courseList) {
  if (typeof courseList[0] === "string") {
    return courseList.map((course) => `<li>${course}</li>`).join("");
  }

  return courseList.map((course) => `<li>${Object.keys(course)}</li>`).join("");
}
