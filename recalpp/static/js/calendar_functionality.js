"use strict";

/**
 * Gets the meeting times for a course and returns an array of meeting objects
 * @param {Array} course - course object
 * @return {Object} - Meetings for the course
 */
async function getMeetingTimes(course) {
  const meetings = [];
  // TODO this takes a long time to render. Can we speed it up?
  await $.getJSON(`/api/v1/course_meetings/${course.guid}/`).then((data) => {
    data.forEach((meeting) => {
      processMeeting(meeting, meetings);
    });
  });

  return meetings;
}

/**
 * Processes a single meeting object and adds meeting details for each day to the meetings array
 * @param {Object} meeting - Meeting object from the class meeting's schedule
 * @param {Array} meetings - Array to store meeting details for each day
 */
function processMeeting(meeting, meetings) {
  const days_map = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
  };

  // convert meeting.days from a string like "['M', 'W']" to an array like ['Monday', 'Wednesday']
  const days = meeting.days
    .replace(/[\[\]']+/g, "")
    .split(", ")
    .map((day) => days_map[day]);

  days.forEach((day) => {
    // if there are no days listed for the meeting, skip it
    if (day !== undefined) {
      meetings.push({
        day: day,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        class_subject_code: meeting.class_subject_code,
        class_catalog_number: meeting.class_catalog_number,
        class_section: meeting.class_section,
      });
    }
  });
}

/**
 * Generates a random light color in the form of a string, e.g. "#A0C0F0"
 * @returns {string} - randomly generated light color
 */
function getRandomLightColor() {
  const hue = Math.floor(Math.random() * 360); // 0-359 degrees
  const saturation = Math.floor(Math.random() * 25) + 75; // 75-100%
  const lightness = Math.floor(Math.random() * 25) + 75; // 75-100%
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return color;
}

/**
 * Adds a course to the calendar
 * @param {Object} course - course object
 */
async function addCourseToCalendar(course) {
  const meetings = await getMeetingTimes(course);
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


  // Dictionary object to store the color for each course
  const courseColors = {};

  // Generate a new color or use an existing one for this course
  const courseKey = `${course.subject}${course.catalog_number}`;
  const color = courseColors[courseKey] || getRandomLightColor();
  courseColors[courseKey] = color;
  for (let i = 0, len = meetings.length; i < len; i++) {
    const { day, startTime, endTime, class_subject_code, class_catalog_number, class_section } = meetings[i];

    const date = getIsoDateForDay(day);
    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;

    const event = {
      id: `${course.guid}-${class_section}`,
      title: `${class_subject_code}${class_catalog_number} ${class_section}`,
      start: start,
      end: end,
      color: color,
      textColor: "#333",
    };

    calendar.addEvent(event);
    User.addCourseMeeting(course.guid, event);

    const listItem = document.querySelector(`li[data-course='${JSON.stringify({ guid: course.guid })}']`);
    if (listItem) {
      listItem.remove();
    }
  }
}

/**
 * Removes a course from the calendar
 * @param {Object} guid - course guid
 * @returns {Object} - event object
 */
function removeCourseFromCalendar(guid) {
  const events = User.getCourseMeetingsByGuid(guid);
  User.removeCourseMeetings(guid);
  events.forEach((event) => {
    const calendarEvent = calendar.getEventById(event.id)
    calendarEvent.remove();
  });
}
