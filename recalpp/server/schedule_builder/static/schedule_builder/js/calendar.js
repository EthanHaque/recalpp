"use strict";

var calendar;

$(document).ready(function () {
  var calendarEl = $("#calendar");

  calendar = new FullCalendar.Calendar(calendarEl[0], {
    headerToolbar: false,
    initialView: "timeGridWeekdays",
    views: {
      timeGridWeekdays: {
        type: "timeGrid",
        duration: { days: 5 },
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "23:00:00",
        // dayHeaders: false,
        // height: "auto",
        initialDate: "2000-01-01", // yyyy-mm-dd
      },
    },

    events: [
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2000-01-01-01T16:00:00",
        allDay: true,
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    ],
  });

  calendar.render();
});
