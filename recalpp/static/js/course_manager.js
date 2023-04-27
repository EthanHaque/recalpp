"use strict";

function updateEnrolledCourses() {
  const enrolledCoursesList = User.getEnrolledCourses().map(
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
       </li>
     `
    )
    .join("");

    $("#enrolled-courses").html(enrolledCoursesList);
}