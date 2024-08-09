import { SelectTypeModal } from "./SelectTypeModal";
import { AuthModal } from "./AuthModal";
import { ElementModal } from "./ElementModal";
import { JsonModal } from "./JsonModal";
import { PickFileModal } from "./PickFileModal";
import { QRImageModal } from "./QRImageModal";
import { SearchElementsModal } from "./SearchElementsModal";
import { SendReqModal } from "./SendReqModal";
import { SQLQueryModal } from "./SQLQueryModal";
import { StartModal } from "./StartModal";

export const getCurrentModal = () => {
    const modalDiv = $('#modals-wrap.active').find('.modal.active');
    if (modalDiv.length == 0)
        return;

    let modalWindow;
    const elementId = modalDiv.find('.params').attr('data-id');

    if (modalDiv.hasClass('type-select-modal')) {
        const types = document.main.configGraph.getElementChildrensTypes(elementId);
        modalWindow = new SelectTypeModal(types);
    } else if (modalDiv.hasClass('qr')) {
        modalWindow = new QRImageModal({});
    } else if (modalDiv.hasClass('sql-query')) {
        modalWindow = new SQLQueryModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('auth')) {
        modalWindow = new AuthModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('pick-file')) {
        modalWindow = new PickFileModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('start')) {
        modalWindow = new StartModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('send-req')) {
        modalWindow = new SendReqModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('json')) {
        modalWindow = new JsonModal();
        modalWindow.modal = modalDiv;
    } else if (modalDiv.hasClass('search')) {
        modalWindow = new SearchElementsModal();
        modalWindow.modal = modalDiv;
    } else {
        const element = document.main.configGraph.getElementById(elementId);
        modalWindow = new ElementModal(element);
    }
    modalWindow.modal = modalDiv;
    return modalWindow;
}

export const getModals = (modalSelector) => {
    const modalsDiv = $('#modals-wrap.active').find(`.modal${modalSelector}`);
    if (modalsDiv.length == 0)
        return;

    let modalWindow = '';
    let modalsWindow = [];

    for (var i = modalsDiv.length - 1; i >= 0; i--) {
        let modalDiv = $(modalsDiv[i]);
        let elementId = modalDiv.find('.params').attr('data-id');

        if (modalDiv.hasClass('type-select-modal')) {
            let types = document.main.configGraph.getElementChildrensTypes(elementId);
            modalWindow = new SelectTypeModal(types);
        } else if (modalDiv.hasClass('qr')) {
            modalWindow = new QRImageModal();
        } else if (modalDiv.hasClass('sql-query')) {
            modalWindow = new SQLQueryModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('auth')) {
            modalWindow = new AuthModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('pick-file')) {
            modalWindow = new PickFileModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('start')) {
            modalWindow = new StartModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('json')) {
            modalWindow = new JsonModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('search')) {
            modalWindow = new SearchElementsModal();
            modalWindow.modal = modalDiv;
        } else {
            let element = document.main.configGraph.getElementById(elementId);
            modalWindow = new ElementModal(element);
        }
        modalWindow.modal = modalDiv;
        modalsWindow.push(modalWindow);
    }

    return modalsWindow;
}