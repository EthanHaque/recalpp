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
      const guid = calendar_event_object.event.id.split("-")[0];
      const courseIndex = calendar_event_object.event.id.split("-")[1];
      const events = User.getCourseMeetingsByGuid(guid);
      const numMeetingsForCourse = events.length;
    
      const saturatedLightColor = getDesaturatedColor(events[courseIndex].color, -70);
      const saturatedDarkColor = darkenColor(saturatedLightColor);
    
      if (events[courseIndex].enrolled) {
        events[courseIndex].enrolled = false;
        // Changes all relevant sections enrolled false and color to default
        for (let i = 0; i < numMeetingsForCourse; i++) {
          if (events[courseIndex].section === events[i].section) {
            events[i].enrolled = false;
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('backgroundColor', events[i].color);
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('borderColor', events[i].color);
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('textColor', '#fff');
          }
        } 
      } else {
        events[courseIndex].enrolled = true;
        // Change all relevant sections to enrolled true and resaturate the event
        for (let i = 0; i < numMeetingsForCourse; i++) {
          if (events[courseIndex].section === events[i].section) {
            events[i].enrolled = true;
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('backgroundColor', saturatedLightColor);
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('borderColor', saturatedLightColor);
            calendar_event_object.view.calendar.getEventById(events[i].id).setProp('textColor', saturatedDarkColor);
          }
        } 
      }
    }
  });
  
  calendar.render();
});
