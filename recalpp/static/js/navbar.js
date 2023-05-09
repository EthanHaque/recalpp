"use strict";


/**
 * Adds an event listener for the "DOMContentLoaded" event to initialize user button functionality.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", function () {
  const userButton = document.getElementById("userButton");
  const userDropdown = document.getElementById("userDropdown");

  userButton.addEventListener("click", function () {
    userDropdown.classList.toggle("hidden");
  });
});
