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
  const preqCourses = User.getRelevantCourses();
  const prereqsMet = getPrereqsMet(preqCourses);
  let relevantCoursesHtml = ``;

  console.log(prereqsMet);

  if (User.getMajor() !== "" && Object.keys(prereqsMet).length > 0) {
    Object.values(prereqsMet).forEach(function (course) {
      relevantCoursesHtml += `
    <li class="group flex items-center justify-between">
      <div class="block w-11/12 h-max">
        <div class="pl-4 ml-px w-full border-transparent text-slate-700 dark:text-slate-400">
          <div class="flex flex-row justify-between">
            <div class="flex-initial w-64">
              ${course.crosslistings_string}
            </div>
            <div class="text-right">
            <span class="break-all" style="white-space: nowrap">${course.distribution_areas}</span>
            </div>
          </div>
        </div>
      </div>
    </li>`;
    });
  } else if (Object.keys(prereqsMet).length === 0 && User.getMajor() !== "") {
    relevantCoursesHtml = `
    <li class="group flex items-center justify-between">
      <div class="block w-11/12 h-max">
        <div class="pl-4 ml-px w-full border-transparent text-slate-700 dark:text-slate-400">
          <div class="flex flex-row justify-between">
            No courses to display for the selected major ${User.getMajor()}.
           </div>
        </div>
      </div>
    </li>`;
  } else {
    relevantCoursesHtml = `
    <li class="group flex items-center justify-between">
      <div class="block w-11/12 h-max">
        <div class="pl-4 ml-px w-full border-transparent text-slate-700 dark:text-slate-400">
          <div class="flex flex-row justify-between">
            No Major Selected. Go to settings to select a major.
           </div>
        </div>
      </div>
    </li>`;
  }

  return relevantCoursesHtml;
}
