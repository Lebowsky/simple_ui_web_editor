import { selectors } from "../../conf";
import { ModalWindow } from './ModalWindow';

export class StartModal extends ModalWindow {
  constructor() {
    super();
    this.modal = $('');
    this.html = '';
  }
  render() {
    this.html = `
            <div class='modal start' data-modal-type='start'>
                <div class='modal-head'>
                    <h2 class='modal-title'>Start</h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderContent());

    return this;
  }
  renderContent() {
    const html = `
            <button id="new-project" onclick="pickNewFileProject(document.main)">New Project</button>
            <button id="open-project" onclick="showPickFileModal()">Open Project</button>
        `;
    return html;
  }
}
