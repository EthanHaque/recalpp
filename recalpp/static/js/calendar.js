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

    events: [
      // {
      //   groupId: 999,
      //   title: "Repeating Event",
      //   start: "2000-01-01-01T16:00:00",
      //   allDay: true,
      //   daysOfWeek: [1, 2, 3, 4, 5],
      // },
      // {
      //   title: "Meeting",
      //   start: "2000-01-01T10:30:00",
      //   end: "2000-01-01T12:30:00",
      // },
    ],
  });

  calendar.render();
});
