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
    eventClick: function(calendar_event_object) {
      // change the border color just for fun
      //info.el.style.color = color;
      //info.el.style.textColor = darkColor;
      const guid = calendar_event_object.event.id.split("-")[0];
      const events = User.getCourseMeetingsByGuid(guid);
      const saturatedLightColor = getDesaturatedColor(events[0].color, -70);
      const saturatedDarkColor = darkenColor(saturatedLightColor);
      calendar_event_object.el.style.backgroundColor = saturatedLightColor;
      calendar_event_object.el.style.borderColor = saturatedLightColor;
      calendar_event_object.el.style.textColor = saturatedDarkColor;
      console.log(saturatedLightColor);
    }
  });
  
  calendar.render();
});
