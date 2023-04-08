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
        <div class="flex items-center gap-3 p-2">
        <h3 class="hover:underline hover:cursor-pointer text-black text-sm dark:text-white">
            ${course.crosslistings}
            <br />
            ${course.long_title}
        </h3>
        </div>
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
