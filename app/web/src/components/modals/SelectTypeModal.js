import { ModalWindow } from './ModalWindow';

export class SelectTypeModal extends ModalWindow {
  constructor(types, parentId) {
    super();
    this.types = types;
    this.parentId = parentId;
    this.modal = $('');
    this.html = '';
    this.selectedValue;
  }
  render() {
    this.html = `
            <div class='modal type-select-modal' data-modal-type='element'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Select type</h2>
                </div>
                <div class='modal-content'>
                    <div class="params" data-id="${this.parentId}">
                    ${this.types.map(type => {
      return `
                        <div class="param active">
                            <input type="radio" name="type" id="${type}" value="${type}">    
                            <label for="${type}">${type}</label>
                        </div>`;
    }).join('')}
                        <div class="btn-group modal-btn">
                            <button class="btn-type-select">Select</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    this.modal = $(this.html);
    return this;
  }
  setSelectedValue(value) {
    this.selectedValue = value;
  }
}
