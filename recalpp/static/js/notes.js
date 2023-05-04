"use strict";

function init() {
    updateUserNotes();
}

$(document).ready(init);

function updateUserNotes() {
    // Get a jQuery reference to the HTML element
    const $notesTextarea = $("#notes-textarea");
            
    // Update user notes every time change is detected
    $notesTextarea.on("input", () => {
    const newNotes = $notesTextarea.val();
    User.setNotes(newNotes);
    });
}