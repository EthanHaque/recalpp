"use strict";

/**
 * Displays metric data in right sidebar
 */
function displayMetrics() {
  const metrics = User.getMetrics();
  const generalMetricsContainer = $("#general-metrics-content");
  const distributionsMetricsContainer = $("#distribution-metrics-content");
  const relevantCoursesMetricsContainer = $(
    "#relevant-courses-metrics-content"
  );

  let generalMetricsHtml = buildGeneralMetricsHtml(metrics);
  let distributionsMetricsHtml = buildDistributionsMetricsHtml(metrics);
  let relevantCoursesMetricsHtml = buildRelevantCoursesMetricsHtml(metrics);

  generalMetricsContainer.html(generalMetricsHtml);
  distributionsMetricsContainer.html(distributionsMetricsHtml);
  relevantCoursesMetricsContainer.html(relevantCoursesMetricsHtml);
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
 * Builds relevant courses metric HTML
 * @param {Object} metrics - metric data
 * @return {string} - generated HTML
 */
function buildRelevantCoursesMetricsHtml(metrics) {
  // const prereqCourses = getPrereqCourses();
  const prereqsMet = getPrereqsMet({});
  let relevantCoursesHtml = ``;

  Object.values(prereqsMet).forEach(function (course) {
    relevantCoursesHtml += `
    <li class="group border-solid border-b flex items-center justify-between">
    <div class="block w-11/12 h-max">
      <div class="ml-px w-full border-transparent text-slate-700 dark:text-slate-400">
        <div class="flex flex-row justify-between">
          <div class="flex-initial">
            ${course.crosslistings_string}
          </div>
          <div class="text-right">
            ${course.distribution_areas}
          </div>
         </div>
       </div>
     </div>`;
  });

  return relevantCoursesHtml;
}

// Scaffolding for Major Selection Affecting Metrics

// /**
//  * Handles Selection of Major
//  */
// function handleMajorSelection(selected_major) {

//   const major_code = selected_major;
//   getDegreeProgress(major_code, displayDegreeProgress);

// }