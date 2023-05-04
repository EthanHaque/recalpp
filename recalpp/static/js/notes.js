"use strict";

function init() {
  initializeUserNotesElement();
}

$(document).ready(init);

/**
 * Initializes the user notes element
 */
function initializeUserNotesElement() {
  const $notesTextarea = $("#notes-textarea");
  const processChange = debounce(() => saveUserNotes());
  $notesTextarea.on("input", processChange);
}

/**
 * Sets the user notes in the notes textarea
 */
function setUserNotes() {
  const $notesTextarea = $("#notes-textarea");
  $notesTextarea.val(User.getNotes());
}

/**
 * Saves the user notes to the database
 */
function saveUserNotes() {
  const $notesTextarea = $("#notes-textarea");
  User.setNotes($notesTextarea.val());
}

/**
 * Debounces a function
 * @param {*} func
 * @param {*} timeout - milliseconds
 * @returns  {Function} - debounced function
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
