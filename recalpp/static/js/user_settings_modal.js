"use strict";

/**
 * Adds an event listener for the document's "ready" event to initialize functionality for closing a modal.
 * @returns {void}
 */
$(document).ready(function () {
  const closeModalButton = $("#modal-id button[type='button']");
  closeModalButton.on("click", function () {
    toggleModal("modal-id");
  });
});


/**
 * Toggles the visibility of a modal.
 * @param {string} modalID - The ID of the modal element.
 * @returns {void}
 */
function toggleModal(modalID) {
  const modal = $("#" + modalID);
  const settingsButton = $("#userDropdown");
  const modalBackdrop = $("#" + modalID + "-backdrop");
  settingsButton.addClass("hidden");
  modal.toggleClass("hidden");
  modalBackdrop.toggleClass("hidden");
  modal.toggleClass("flex");
  modalBackdrop.toggleClass("flex");
}
