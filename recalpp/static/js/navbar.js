"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const userButton = document.getElementById("userButton");
  const userDropdown = document.getElementById("userDropdown");

  userButton.addEventListener("click", function () {
    userDropdown.classList.toggle("hidden");
  });
});
