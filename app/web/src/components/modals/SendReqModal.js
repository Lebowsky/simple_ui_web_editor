import { selectors } from "../../conf";
import { renderEditor } from "../../handlers";
import { ModalWindow } from './ModalWindow';

export class SendReqModal extends ModalWindow {
  constructor(ipAddress) {
    super();
    this.modal = $('');
    this.html = '';
    this.ipAddress = ipAddress;
  }
  render() {
    this.html = `
            <div class='modal send-req' data-modal-type='send-req'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Send Request<span class='edited'>*</span></h2>
                </div>
                <div class='modal-content'> </div>
            </div>
            `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderContent());
    const data = {};

    document.main.settings.reqBodyEditor = renderEditor(this.modal.find("#req-body")[0], '');

    return this;
  }
  renderContent() {
    const html = `
        <div>
            <div id="send-req-content">
                <div id="req-params-wrap">
                    <div class="param active">
                        <label for="ip-address">IP Address</label>
                        <input type="text" name="ip-address" value="${this.ipAddress}" id="ip-address">
                    </div>
                    <div class="param active">
                        <label for="req-mode">Mode</label>
                        <select name="req-mode" id="req-mode">
                            <option value="SyncCommand" selcted>Sync Command</option>
                            <option value="BackgroundCommand">Background Command</option>
                        </select>
                    </div>
                    <div class="param active">
                        <label for="req-params">Param Value</label>
                        <input type="text" name="req-params" value="" id="req-params">
                    </div>
                    <div class="btn-wrap">
                        <button onclick="sendRequest(this)">send</button>
                    </div>
                </div>
                <div class="param active">
                    <label onclick="showList(this)" for="req-body">Body <i class="fa fa-angle-up" aria-hidden="true"></i></label>
                    <div id="req-body" class="list-wrap"></div>
                </div>
            </div>
        </div>
        <div id="req-result-wrap"></div>
        `;
    return html;
  }
  renderRequestResult(data) {
    this.modal.find("#req-result-wrap").html("");
    renderEditor(this.modal.find("#req-result-wrap")[0], data);
  }
  renderEditor(node, data = '') {
    const editor = new JSONEditor(node, {
      mode: 'code'
    });

    editor.set(data);

    return editor;
  }
}
