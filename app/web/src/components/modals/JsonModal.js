import { selectors } from "../../conf";
import { renderEditor } from "../../handlers";
import { ModalWindow } from './ModalWindow';

export class JsonModal extends ModalWindow {
  constructor(json) {
    super();
    this.modal = $('');
    this.html = '';
    this.json = json;
  }
  render() {
    this.html = `
            <div class='modal json' data-modal-type='json'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Json</h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderContent());
    renderEditor(this.modal.find("#json-editor")[0], this.json);

    return this;
  }
  renderContent() {
    const html = `<div id="json-editor"></div>`;

    return html;
  }
}
