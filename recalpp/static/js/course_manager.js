"use strict";

/**
 * Displays Enrolled Courses
 */
function displayEnrolledCourses() {
  const enrolledCourses = User.getEnrolledCourses();
  const enrolledCoursesList = Object.values(enrolledCourses)
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
                <span class="break-all" style="white-space: nowrap">${course.distribution_areas}</span>
              </div>
             </div>
           </div>
           <div class="pl-4 ml-px w-full border-transparent text-slate-700 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 duration-75">
             ${course.title}
           </div>
         </div>
         <button class="w-1/12 bg-red-500 text-white font-semibold text-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-75 remove-from-enrolled" data-course-guid='${course.guid}'>
           -
         </button>
       </li>
     `
    )
    .join("");

  $("#enrolled-courses").html(enrolledCoursesList);

  $(".remove-from-enrolled").on("click", function (event) {
    const guid = $(this).data().courseGuid;
    removeCourseFromEnrolled(guid);
  });
}

/**
 * Removes from Enrolled Courses
 * @param {string} guid - Course GUID
 */
function removeCourseFromEnrolled(guid) {
  const course = User.removeFromEnrolledCourses(guid);
  displayEnrolledCourses();
  removeCourseFromCalendar(guid);
  updateEnrolledCoursesHeader();
  displayMetrics();
  // Call handleCourseSearch() to add the course back to the search list
  addCourseToList(course);
}

/**
 * Updates the Enrolled Courses Header Text
 */
function updateEnrolledCoursesText() {
  const enrolledCoursesCount = User.getEnrolledCoursesCount();
  const enrolledCoursesText =
    enrolledCoursesCount === 1
      ? "1 Enrolled Course"
      : `${enrolledCoursesCount} Enrolled Courses`;
  $("#enrolled-courses-text").text(enrolledCoursesText);
}

/**
 * Updates the Enrolled Courses Header
 */
function updateEnrolledCoursesHeader() {
  updateEnrolledCoursesText();
  const enrolledCoursesHeader = $("#enrolled-courses-container");
  // Check if the user has any enrolled courses
  if (User.getEnrolledCoursesCount() > 0) {
    // If yes, show the "Enrolled Courses" text
    enrolledCoursesHeader.removeClass("hidden");
  } else {
    enrolledCoursesHeader.addClass("hidden");
  }
}
