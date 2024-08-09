import { selectors } from "../../conf";
import { ModalWindow } from './ModalWindow';

export class SearchElementsModal extends ModalWindow {
  constructor(json) {
    super();
    this.modal = $('');
    this.html = '';
  }
  render() {
    this.html = `
            <div class='modal search' data-modal-type='element'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Search Elements</h2>
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
        <div>
            <div id="search-content">
                <div id="search-params-wrap">
                    <div class="param active">
                        <label for="ip-address">Search</label>
                        <input type="text" name="search" value="" id="search" autofocus>
                    </div>
                </div>
            </div>
        </div>
        <div id="search-result-wrap" class="list ui-sortable"></div>
        `;
    return html;
  }
}
