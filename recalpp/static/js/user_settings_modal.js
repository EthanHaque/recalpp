"use strict";

$(document).ready(function () {
  const closeModalButton = $("#modal-id button[type='button']");
  closeModalButton.on("click", function () {
    toggleModal("modal-id");
  });
});

function toggleModal(modalID) {
  const modal = $("#" + modalID);
  const modalBackdrop = $("#" + modalID + "-backdrop");

  modal.toggleClass("hidden");
  modalBackdrop.toggleClass("hidden");
  modal.toggleClass("flex");
  modalBackdrop.toggleClass("flex");
}
