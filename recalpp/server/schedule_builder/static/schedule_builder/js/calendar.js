"use strict";

$(document).ready(function () {
  var calendarEl = $("#calendar");

  var calendar = new FullCalendar.Calendar(calendarEl[0], {
    headerToolbar: false,
    initialView: "timeGridWeekdays",
    views: {
      timeGridWeekdays: {
        type: "timeGrid",
        duration: { days: 5 },
      },
    },
    allDaySlot: false,
    slotMinTime: "08:00:00",
    slotMaxTime: "23:00:00",
    dayHeaders: false,
    height: "auto",

    events: [
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2000-01-01T16:00:00",
      },
    ],
  });

  calendar.render();
});
