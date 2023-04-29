"use strict";

/**
 * U
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
                ${course.distribution_areas}
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

function removeCourseFromEnrolled(guid) {
  const course = User.removeFromEnrolledCourses(guid);
  displayEnrolledCourses();
  removeCourseFromCalendar(guid);
  showEnrolledCoursesText();
  displayMetrics();
  // Call handleCourseSearch() to add the course back to the search list
  addCourseToList(course);
}

function updateEnrolledCoursesText() {
  const enrolledCoursesCount = Object.keys(User.enrolledCourses).length;
  const enrolledCoursesText = enrolledCoursesCount === 1 ? '1 Enrolled Course' : `${enrolledCoursesCount} Enrolled Courses`;
  $('#enrolled-courses-text').text(enrolledCoursesText);
}

function showEnrolledCoursesText() {
  updateEnrolledCoursesText();
  const enrolledCoursesHeader = $("#enrolled-courses-container");
  // Check if the user has any enrolled courses
  if (Object.keys(User.enrolledCourses).length > 0) {
    // If yes, show the "Enrolled Courses" text
    enrolledCoursesHeader.removeClass("hidden");
  } else {
    enrolledCoursesHeader.addClass("hidden");
  }
}


