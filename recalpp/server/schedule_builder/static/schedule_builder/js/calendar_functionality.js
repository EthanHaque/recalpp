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
 export function addCourseToCalendar(course) {
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