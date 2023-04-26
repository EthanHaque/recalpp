/**
 * Gets the meeting times for a course and returns an array of meeting objects
 * @param {Array} course - course object
 * @return {Object} - Meetings for the course
 */
async function getMeetingTimes(course) {
  const meetings = [];

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

  meetings.forEach((meet) => {
    const date = getIsoDateForDay(meet.day);
    const start = `${date}T${meet.startTime}`;
    const end = `${date}T${meet.endTime}`;

    const event = {
      title: `${meet.class_subject_code}${meet.class_catalog_number} ${meet.class_section}`,
      start: start,
      end: end,
    };

    // Add the event to the calendar
    calendar.addEvent(event);
  });
}