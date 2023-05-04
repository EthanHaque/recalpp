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
function toggleEventEnrollment(calendar_event_object) {
  const guid = calendar_event_object.event.id.split("-")[0];
  const courseIndex = calendar_event_object.event.id.split("-")[1];
  const events = User.getCourseMeetingsByGuid(guid);
  const numMeetingsForCourse = events.length;

  const enrolled = events[courseIndex].enrolled;
  events[courseIndex].enrolled = !enrolled;

  const meetingIdentifier = events[courseIndex].section.charAt(0);
  const baseColor = events[courseIndex].color;
  const lightColor = getDesaturatedColor(baseColor, !enrolled ? -80 : 80);
  const darkColor = darkenColor(lightColor);

  for (let i = 0; i < numMeetingsForCourse; i++) {
    const sameSection = events[courseIndex].section === events[i].section;
    const sameMeetingType = meetingIdentifier === events[i].section.charAt(0);

    if (sameSection) {
      events[i].enrolled = !enrolled;
      updateEventColors(
        calendar_event_object.view.calendar,
        events[i].id,
        lightColor,
        darkColor
      );
    }

    if (sameMeetingType && !events[i].enrolled && !sameSection) {
      if (enrolled) {
        calendar_event_object.view.calendar.addEvent(events[i]);
      } else {
        calendar_event_object.view.calendar.getEventById(events[i].id).remove();
      }
    }
  }
  User.saveUserProfile();
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
