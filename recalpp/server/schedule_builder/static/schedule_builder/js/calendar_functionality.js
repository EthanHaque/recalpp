/**
 * Initializes the calendar
 * @param {Array} course - course object
 * @return {Object} - Meetings for the course
 */
function getMeetingTimes(course) {
  const meetings = [];

  course.classes.forEach((class_meet) => {
    processClassMeet(class_meet, meetings);
  });

  return meetings;
}

/**
 * Processes a single class meeting object and populates the meetings array with meeting details
 * @param {Object} class_meet - Class meeting object from the course
 * @param {Array} meetings - Array to store meeting details for each day
 */
function processClassMeet(class_meet, meetings) {
  Object.values(class_meet.schedule.meetings).forEach((meeting) => {
    processMeeting(meeting, meetings);
  });
}

/**
 * Processes a single meeting object and adds meeting details for each day to the meetings array
 * @param {Object} meeting - Meeting object from the class meeting's schedule
 * @param {Array} meetings - Array to store meeting details for each day
 */
function processMeeting(meeting, meetings) {
  const start_time = meeting.start_time;
  const end_time = meeting.end_time;

  const days_map = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
  }

  meeting.days.forEach((day) => {
    meetings.push({
      day: days_map[day],
      startTime: start_time,
      endTime: end_time,
    });
  });
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
  if (ampm.toLowerCase() === "pm" && hours24 !== 12) {
    hours24 += 12;
  }
  // If the input is in AM and it's 12:00 AM, set the hours to 0
  else if (ampm.toLowerCase() === "am" && hours24 === 12) {
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
  const meetings = getMeetingTimes(course);

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

  meetings.forEach((meet) => {
    const time24Star = convertTo24Hour(meet.startTime);
    const time24End = convertTo24Hour(meet.endTime);
    const start = `${getIsoDateForDay(meet.day)}T${time24Star}`;
    const end = `${getIsoDateForDay(meet.day)}T${time24End}`;

    const event = {
      title: `${course.crosslistings_string} - ${course.title}`,
      start: start,
      end: end,
    };

    // Add the event to the calendar
    calendar.addEvent(event);
  });
}
