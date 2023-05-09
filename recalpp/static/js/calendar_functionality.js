"use strict";

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

function addUserMeetingsToCalendar(meetings) {
  meetings.forEach((meeting) => {
    calendar.addEvent(meeting);
  });
}

/** 
 * Helper function to create ISO date strings for each day of the week
 * @param {string} day - day of the week
 * @return {string} - ISO date string for the day
 */
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


/**
 * Adds a course to the calendar
 * @param {Object} course - course object
 */
async function addCourseToCalendar(course, save = true) {
  const meetings = await getMeetingTimes(course);
  
  const meetingSections = getMeetingSections(meetings);
  const uniqueMeetings = getUniqueMeetings(meetingSections);
  const lightSaturatedColor = getRandomLightColor();
  const darkSaturatedColor = darkenColor(lightSaturatedColor);
  const lightDesaturatedColor = getDesaturatedColor(lightSaturatedColor, 80);
  const darkDesaturatedColor = darkenColor(lightDesaturatedColor);
  
  meetings.forEach((meet, index) => {
    const date = getIsoDateForDay(meet.day);
    const start = `${date}T${meet.startTime}`;
    const end = `${date}T${meet.endTime}`;
    const isUnique = uniqueMeetings.some(section => section === meet.class_section);
    if (isUnique) {
      const event = {
        id: `${course.guid}-${index}`,
        section: meet.class_section,
        enrolled: true,
        title: `${meet.class_subject_code}${meet.class_catalog_number} ${meet.class_section}`,
        start: start,
        end: end,
        color: lightSaturatedColor,
        textColor: darkSaturatedColor,
      };
      // Add the event to the calendar
      calendar.addEvent(event);
      User.addCourseMeeting(course.guid, event);
    } else {
      const event = {
        id: `${course.guid}-${index}`,
        section: meet.class_section,
        enrolled: false,
        title: `${meet.class_subject_code}${meet.class_catalog_number} ${meet.class_section}`,
        start: start,
        end: end,
        color: lightDesaturatedColor,
        textColor: darkDesaturatedColor,
      };
      // Add the event to the calendar
      calendar.addEvent(event);
      User.addCourseMeeting(course.guid, event);
    }
    // Remove the course from the list of available courses
    $(`li[data-course='${JSON.stringify({ guid: course.guid })}']`).remove();
  });
  User.saveUserProfile()
}

/**
 * Removes a course from the calendar
 * @param {Object} guid - course guid
 * @returns {Object} - event object
 */
function removeCourseFromCalendar(guid) {
  const events = User.getCourseMeetingsByGuid(guid);
  User.removeCourseMeeting(guid);
  events.forEach((event) => {
    const calendarEvent = calendar.getEventById(event.id);
    if (calendarEvent !== null) {
      calendarEvent.remove();
    }
  });
}


/**
 * Retrieves the unique meeting sections from a list of meetings.
 * @param {Array} meetings - An array of meeting objects.
 * @returns {Array} - An array containing the unique meeting sections.
 */
function getMeetingSections(meetings) {
  let courseMeetingSections = new Array();
  meetings.forEach((meet) => {
    if (!courseMeetingSections.includes(meet.class_section)) {
      courseMeetingSections.push(meet.class_section);
    }
  });
  return courseMeetingSections;
}


/**
 * Retrieves unique meetings from a list of meeting sections.
 * @param {Array} meetingSections - An array of meeting sections.
 * @returns {Array} - An array containing the unique meetings.
 */
function getUniqueMeetings(meetingSections) {
  let meetingIdentifier = false;
  const uniqueMeetings = [];

  if (meetingSections.length === 1) {
    uniqueMeetings.push(meetingSections[0]);
  }

  for (let i = 0; i < meetingSections.length; i++) {
    const currentSection = meetingSections[i];
    const nextSection = meetingSections[i + 1];
    const prevSection = meetingSections[i - 1];

    if (nextSection && currentSection[0] !== nextSection[0] &&
      (!prevSection || currentSection[0] !== prevSection[0])
      ) {
      meetingIdentifier = true;
    }
    
    if (meetingIdentifier) {
      uniqueMeetings.push(currentSection);
    }

    if (nextSection && currentSection[0] !== nextSection[0]) {
      meetingIdentifier = false;
    }
  }

  return uniqueMeetings;
}