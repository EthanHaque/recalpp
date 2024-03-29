"use strict";

/**
 * Initializes Course Search Event Listener
 */
async function init() {
  $("#course-search").on("input", handleCourseSearch);

  // Wrap the $.getJSON() calls in a Promise
  const currentTermPromise = new Promise((resolve, reject) => {
    $.getJSON("/api/v1/current_term", function (data) {
      resolve(data.current_term);
    }).fail((jqXHR, textStatus, errorThrown) => {
      reject(new Error(`Error fetching current term: ${textStatus}`));
    });
  });

  const subjectCodesPromise = new Promise((resolve, reject) => {
    $.getJSON("/api/v1/subject_codes", function (data) {
      resolve(new Set(data.subject_codes));
    }).fail((jqXHR, textStatus, errorThrown) => {
      reject(new Error(`Error fetching subject codes: ${textStatus}`));
    });
  });

  const distributionsPromise = new Promise((resolve, reject) => {
    $.getJSON("/api/v1/distributions", function (data) {
      resolve(new Set(data.distributions));
    }).fail((jqXHR, textStatus, errorThrown) => {
      reject(new Error(`Error fetching distributions: ${textStatus}`));
    });
  });

  
  // Use Promise.all to wait for all requests to complete
  try {
    const [currentTerm, subjectCodes, distributions] = await Promise.all([
      currentTermPromise,
      subjectCodesPromise,
      distributionsPromise,
    ]);

    // Assign the fetched data to the global variables
    window.currentTerm = currentTerm;
    window.subjectCodes = subjectCodes;
    window.distributions = distributions;

    // TOOD: This should be moved to a separate file.
    userInit();

    // Update the calendar to automatically select the enrolled sections

  } catch (error) {
    console.error(`Error initializing data: ${error}`);
  }
}

$(document).ready(init);

/**
 * Handles Course Search Input Event
 * @param {Event} event - input event object
 */
function handleCourseSearch(event) {
  const search = $(event.target).val().trim();
  const noQueryText = $("#empty-query");

  if (search.length) {
    getCourses(search, updateCourses);
  } else {
    updateCourses([]);
  }

  if (search.length > 0) {
    noQueryText.addClass("hidden");
  } else {
    noQueryText.removeClass("hidden");
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

  const query = constructAPIQuery(parsedSearch);

  $.getJSON("/api/v1/courses", { term_code: currentTerm, ...query }, callback);
}


/**
 * Constructs the API query from the parsed search object
 * @param {*} parsedSearch - parsed search object
 * @returns {object} - API query object
 */
function constructAPIQuery(parsedSearch) {
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
    query.title = parsedSearch.titleTerms.join(" ");
  }

  if (parsedSearch.distributions.length) {
    query.distribution = parsedSearch.distributions.join(",");
  }
  return query;
}

/**
 * Creates a course element from a course object
 * @param {object} course - course object
 * @returns {string} - HTML string for course element
 */
function createCourseElement(course) {
  return `
    <li class="group border-solid border-b flex items-center justify-between">
      <div class="block w-11/12 h-max">
        <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
          <div class="flex flex-row justify-between">
            <div class="flex-initial w-64">
              ${course.crosslistings_string}
            </div>
            <div class="text-right">
            <span class="break-all" style="white-space: nowrap">${course.distribution_areas}</span>
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
  `;
}

/**
 * Binds a click event to the add-to-calendar button
 * @param {string} selector - selector for the add-to-calendar button
 */
function bindAddToCalendarEvent(selector) {
  $(selector).on("click", function () {
    const course = $(this).data().course;
    if (!User.isEnrolledInCourse(course)) {
      enrollUserInCourse(course);
    }
  });
}

/**
 * Enrolls a user in a course and adds the course to the calendar
 * @param {Object} course - course object to enroll the user in
 */
async function enrollUserInCourse(course, save = true) {
  User.addToEnrolledCourses(course);
  await addCourseToCalendar(course, save);
  updateUIAfterEnrollment(course);
}

/**
 * Updates the UI after enrolling a user in a course
 * @param {Object} course - course object the user has enrolled in
 */
function updateUIAfterEnrollment(course) {
  updateEnrolledCoursesHeader();
  displayEnrolledCourses();
  removeCourseFromList(course.guid);
  displayMetrics();
}


/**
 * Adds courses the user has previously enrolled in to the calendar
 */
function addStoredUserCoursesToCalendar() {
  const enrolledCourses = User.getEnrolledCourses();
  const storedMeetings = User.getCourseMeetings();

  // cleaing user enrolled courses and stored meetings
  User.enrolledCourses = {};
  User.courseMeetings = {};

  for (const guid in enrolledCourses) {
    enrollUserInCourse(enrolledCourses[guid], false).then(() => {
      const events = storedMeetings[guid];
      updateEventsFromUserEnrolledCourses(
        events,
        User.getCourseMeetingsByGuid(guid)
      );
    });
  }
}

/**
 * Updates the course list based on the given data
 * @param {Array} courses - array of course objects
 */
function updateCourses(courses) {
  const courseList = courses
    .filter((course) => !User.isEnrolledInCourse(course))
    .map(createCourseElement)
    .join("");

  $("#courses").html(courseList);

  // Bind the click event listener for the add-to-calendar buttons
  bindAddToCalendarEvent(".add-to-calendar");
}

/**
 * Adds a course to the course list while maintaining the original order
 * @param {object} course - course object
 */
function addCourseToList(course) {
  const courseHtml = createCourseElement(course);
  const courseList = $("#courses");
  const courseElements = courseList.find("li");
  let inserted = false;

  // Iterate through the course elements
  courseElements.each(function () {
    const currentElement = $(this);
    const currentCourseData = currentElement
      .find(".add-to-calendar")
      .data("course");

    // Compare the catalog number of the current course element and the new course
    if (
      currentCourseData.catalog_number.localeCompare(course.catalog_number) > 0
    ) {
      // Insert the new course before the current course element
      currentElement.before(courseHtml);
      inserted = true;
      return false; // break out of the loop
    }
  });

  // If the course was not inserted, it should be added to the end of the list
  if (!inserted) {
    courseList.append(courseHtml);
  }

  // Bind the click event listener for the add-to-calendar button of the new course
  bindAddToCalendarEvent(".add-to-calendar");
}

/**
 * Removes a course from the course list based on the given course guid
 * @param {string} guid - The GUID of the course to be removed
 */
function removeCourseFromList(guid) {
  // Find the course element using the guid in the data-course attribute
  const courseElement = $(`.add-to-calendar[data-course*='${guid}']`).closest(
    "li"
  );

  // Remove the course element from the list
  courseElement.remove();
}
