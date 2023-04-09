"use strict";

$(document).ready(() => {
  $("#course-search").on("input", (event) => {
    let search = $(event.target).val().trim();

    if (search.length) {
      $.getJSON("/api/v1/courses", { search: search }, (data) => {
        updateCourses(data);
      });
    } else {
      updateCourses([]);
    }
  });

  // TODO: Get the major code from the user
  let major_code = "COS-BSE";
  $.getJSON("/api/v1/majors", { major_code, major_code }, (data) => {
    displayDegreeProgress(data);
  });
});

function updateCourses(courses) {
  let courseList = "";

  courses.forEach(function (course) {
    courseList += `
        <li>
          <a class="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300" href="">
              ${course.crosslistings}
              <br />
              ${course.long_title}
          </a>
        </li>
    `;
  });

  $("#courses").html(courseList);
}

function displayDegreeProgress(data) {
  const degreeProgressContainer = $("#degree-progress-content");

  let degreeProgressHtml = `
      <h2 class="text-xl font-semibold mb-4">${data.type}: ${data.name} (${data.code})</h2>
      <!-- <p class="mb-4">${data.description}</p> -->
      <h3 class="text-lg font-semibold mb-2">Requirements:</h3>
    `;

  data.req_list.forEach((req) => {
    degreeProgressHtml += `
        <div class="mb-4">
          <h4 class="text-md font-semibold">${req.name}</h4>
          <p>${req.explanation}</p>
      `;

    if (req.req_list) {
      req.req_list.forEach((subReq) => {
        degreeProgressHtml += `
            <div class="ml-4 mb-2">
              <h5 class="text-sm font-semibold">${subReq.name}</h5>
              <ul>
          `;

        if (subReq.course_list) {
          subReq.course_list.forEach((course) => {
            degreeProgressHtml += `<li>${course}</li>`;
          });
        }

        degreeProgressHtml += `
              </ul>
            </div>
          `;
      });
    }

    degreeProgressHtml += `</div>`;
  });

  degreeProgressContainer.html(degreeProgressHtml);
}
