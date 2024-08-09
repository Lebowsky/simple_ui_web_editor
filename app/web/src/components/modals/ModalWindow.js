import { selectors } from "../../conf";
import { sortableInit } from "../../handlers";


export class ModalWindow {
  constructor() {
    this.html = '';
    this.modal = $('');
    this.modalWidth = 820;
  }
  addClass(className) {
    this.modal.addClass(className);
    return this;
  }
  removeClass(className) {
    this.modal.removeClass(className);
    return this;
  }
  show() {
    $("#modals-wrap").addClass("active");
    $(selectors.modal).removeClass("active");
    this.modal.appendTo('#modals-wrap').addClass("active");
    $('.content').addClass("blur");
    $("body").addClass("no-scroll");
    const modalType = this.modal.data("modal-type");
    const modalWidth = localStorage.getItem("modal-" + modalType + "-width") ? localStorage.getItem("modal-" + modalType + "-width") : this.modalWidth;
    this.modal.css('width', modalWidth);
    this.modal.resizable({
      minWidth: 700,
      handles: "e",
      stop: function (event, ui) {
        if (modalType != undefined) {
          const lsItem = "modal-" + modalType + "-width";
          localStorage.setItem(lsItem, ui.size.width);
        }
        document.main.settings.modalWidth = ui.size.width;
      }
    });

    sortableInit(selectors.list);
  }
  close() {
    if (this.modal.siblings(selectors.modal).length) {
      const prevModal = this.modal.prev();
      prevModal.addClass("active");
    } else {
      this.modal.parents("#modals-wrap").removeClass("active");
      $("body").removeClass("no-scroll");
      $('.content').removeClass("blur");
    }
    this.modal.remove();
  }
}
