import { ModalWindow } from './ModalWindow';

export class QRImageModal extends ModalWindow {
  constructor({ hostsOptions, uploadModesOptions }) {
    super();
    this.modal = $('');
    this.html = '';
    this.currentHost = hostsOptions?.[0]?.value;
    this.currentUploadMode = localStorage.currentUploadHandlersMode;
    this.uploadModesOptions = uploadModesOptions;
    this.hostsOptions = hostsOptions;
  }
  render() {
    this.html = `
      <div class='modal qr' data-modal-type='qr'>
        <div class='close-modal'>
          <i class='fa fa-times' aria-hidden='true'></i>
        </div>
        <div class='modal-head'>
          <h2 class='modal-title'>QR Settings<span class='edited'>*</span></h2>
        </div>
        <div class='modal-content'>
          <div class="qr-settings-wrapper">
            <div class="qr-params-wrapper">
              ${this.renderOptions({
      values: this.hostsOptions,
      label: 'Host:',
      name: 'qr-host',
      selectedItem: this.currentHost
    })}
              ${this.renderOptions({
      values: this.uploadModesOptions,
      label: 'Get handlers from:',
      name: 'upload-mode',
      selectedItem: this.currentUploadMode
    })}
            </div>
            <img id="qr-code" src="${this._getImageByHost()}">
          </div>
        </div>
      </div>
      `;
    this.modal = $(this.html);
    return this;
  }
  renderOptions({ values, label, name, selectedItem }) {
    return `
      <div class="qr-params">
        <label for="${name}">${label}</label>
        <select name="${name}" id="${name}">
        ${values.map(({ value, option }) => (
      `<option value="${value}" ${value === selectedItem ? 'selected' : ''}>${option}</option>`
    ))}
        </select>
      </div>
    `;
  }
  show() {
    super.show();
    $('#qr-host').on('change', QRImageModal.hostOnChange);
    $('#upload-mode').on('change', evt => {
      localStorage.currentUploadHandlersMode = evt.target.value;
    });
  }
  static hostOnChange(evt) {
    document.modal.currentHost = evt.target.value;
    $('#qr-code').attr("src", document.modal._getImageByHost());
  }
  _getImageByHost() {
    return this.hostsOptions.filter(el => el.value === this.currentHost)?.[0]?.imgSrc;
  }
}
