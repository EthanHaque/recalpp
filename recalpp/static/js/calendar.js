"use strict";

let calendar;

$(document).ready(function () {
  let calendarEl = $("#calendar");

  calendar = new FullCalendar.Calendar(calendarEl[0], {
    initialView: "timeGridWeekdays",
    headerToolbar: false,
    initialDate: "2000-01-01", // yyyy-mm-dd
    height: "auto",
    dayHeaders: false,
    views: {
      timeGridWeekdays: {
        type: "timeGrid",
        duration: { days: 5 },
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "23:00:00",
      },
    },
    events: [],
    eventClick: function (calendar_event_object) {
      toggleEventEnrollment(calendar_event_object);
    },
  });
  calendar.render();
});

/**
 * Toggles the enrollment of a course meeting.
 * @param {Object} calendar_event_object The event object that was clicked.
 */
function toggleEventEnrollment(calendar_event_object, save = true) {
  const guid = calendar_event_object.event.id.split("-")[0];
  const courseIndex = calendar_event_object.event.id.split("-")[1];
  const events = User.getCourseMeetingsByGuid(guid);
  const event = events[courseIndex];
  event.enrolled = !event.enrolled;
  updateSingleEventEnrollment(event, events);
  if (save) User.saveUserProfile();
}

/**
 * Updates the enrollment of a single event.
 * @param {Object} event The event object.
 * @param {Array} events The array of events.
 */
function updateSingleEventEnrollment(event, events) {
  const enrolled = event.enrolled;
  const meetingIdentifier = event.section.charAt(0);
  const baseColor = event.color;
  const lightColor = getDesaturatedColor(baseColor, enrolled ? -80 : 80);
  const darkColor = darkenColor(lightColor);

  updateEventColors(calendar, event.id, lightColor, darkColor);

  events.forEach((that) => {
    const sameSection = that.section === event.section;
    const sameMeetingType = meetingIdentifier === that.section.charAt(0);

    // treat the event as if it was also toggled
    if (sameSection) {
      updateEventColors(calendar, that.id, lightColor, darkColor);
    }

    // if the event is the same meeting type and is not the same section
    // then add/remove the event from the calendar depending on enrollment
     if (sameMeetingType && !sameSection) {
       const calendarEvent = calendar.getEventById(that.id);
       if (!that.enrolled && !calendarEvent) {
         calendar.addEvent(that);
       } else if (enrolled && calendarEvent) {
         calendarEvent.remove();
       }
     }
  });
}

/**
 * Given a list of events from the user's enrolled courses, update the 
 * calendar to reflect the enrollment. I.e. if the user is enrolled in a
 * particular section of a course, then all the other sections disappear.
 * This should have the same effect as if the user had clicked on the event.
 * @param {*} events The list of events from the user's enrolled courses.
 */
function updateEventsFromUserEnrolledCourses(events) { 
  events.forEach((event) => { 
    if (event.enrolled) {
      updateSingleEventEnrollment(event, events);
    }
  });
}

/**
 * Sets the events colors on the calendar.
 * @param {Object} calendar The calendar object.
 * @param {String} eventId The event id.
 * @param {String} backgroundColor The background color.
 * @param {String} textColor The text color.
 */
function updateEventColors(calendar, eventId, backgroundColor, textColor) {
  calendar.getEventById(eventId).setProp("backgroundColor", backgroundColor);
  calendar.getEventById(eventId).setProp("borderColor", backgroundColor);
  calendar.getEventById(eventId).setProp("textColor", textColor);
}
