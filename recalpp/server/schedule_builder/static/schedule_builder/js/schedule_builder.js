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
      <li class="group border-solid border-b flex items-center justify-between">
        <div class="block w-11/12 h-max">
          <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
            ${course.crosslistings}
          </div>
          <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
            ${course.long_title}
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

/**
 * Initializes the calendar
 * @param {Array} course - course object
 * @return {Object} - Times the course is offered
 */
function getCourseTimes(course) {
  const days = [];

  if (course.mon === "Y") days.push("Monday");
  if (course.tues === "Y") days.push("Tuesday");
  if (course.wed === "Y") days.push("Wednesday");
  if (course.thurs === "Y") days.push("Thursday");
  if (course.fri === "Y") days.push("Friday");

  return {
    days: days,
    startTime: course.start_time,
    endTime: course.end_time,
  };
}

/**
 * Converts a time string in "HH:mm AM/PM" format to a 24-hour time format
 * @param {string} time12h - Time string in "HH:mm AM/PM" format
 * @return {string} - Time string in 24-hour format
 */
function convertTo24Hour(time12h) {
  // Extract hours, minutes, and the AM/PM part from the input time string
  const [time, ampm] = time12h.split(" ");
  const [hours, minutes] = time.split(":");

  // Convert the hours to a number
  let hours24 = parseInt(hours, 10);

  // If the input is in PM and it's not 12:00 PM, add 12 to the hours
  if (ampm === "pm" && hours24 !== 12) {
    hours24 += 12;
  }
  // If the input is in AM and it's 12:00 AM, set the hours to 0
  else if (ampm === "am" && hours24 === 12) {
    hours24 = 0;
  }

  // Return the time in 24-hour format, padding the hours with a zero if needed
  return `${hours24.toString().padStart(2, "0")}:${minutes}:00`;
}

/**
 * Adds a course to the calendar
 * @param {Object} course - course object
 */
function addCourseToCalendar(course) {
  const times = getCourseTimes(course);

  // Helper function to create ISO date strings for each day of the week
  function getIsoDateForDay(day) {
    const baseDate = new Date("2000-01-01T00:00:00");
    const dayOffset = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
    };
    baseDate.setDate(baseDate.getDate() + dayOffset[day]);
    return baseDate.toISOString().slice(0, 10);
  }

  times.days.forEach((day) => {
    const time24Star = convertTo24Hour(times.startTime);
    const time24End = convertTo24Hour(times.endTime);
    const start = `${getIsoDateForDay(day)}T${time24Star}`;
    const end = `${getIsoDateForDay(day)}T${time24End}`;

    const event = {
      title: `${course.crosslistings} - ${course.long_title}`,
      start: start,
      end: end,
    };

    // Add the event to the calendar
    calendar.addEvent(event);
  });
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
  if (data && data.req_list) {
    const reqListHtml = data.req_list.map(buildReqHtml).join("");
    return `
      <h2 class="text-xl font-semibold mb-4">${data.type}: ${data.name} (${data.code})</h2>
      <h3 class="text-lg font-semibold mb-2">Requirements:</h3>
      ${reqListHtml}
    `;
  }
  
  return ``;
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
