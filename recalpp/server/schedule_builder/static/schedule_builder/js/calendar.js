document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
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

    events: [
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2023-04-12T16:00:00",
      },
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2023-01-16T16:00:00",
      },
      {
        title: "Conference",
        start: "2023-01-11",
        end: "2023-01-13",
      },
      {
        title: "Meeting",
        start: "2023-01-12T10:30:00",
        end: "2023-01-12T12:30:00",
      },
      {
        title: "Lunch",
        start: "2023-01-12T12:00:00",
      },
      {
        title: "Meeting",
        start: "2023-01-12T14:30:00",
      },
      {
        title: "Happy Hour",
        start: "2023-01-12T17:30:00",
      },
      {
        title: "Dinner",
        start: "2023-01-12T20:00:00",
      },
      {
        title: "Birthday Party",
        start: "2023-01-13T07:00:00",
      },
      {
        title: "Click for Google",
        url: "http://google.com/",
        start: "2023-01-28",
      },
    ],
  });

  calendar.render();
});
