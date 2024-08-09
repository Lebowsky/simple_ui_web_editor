import { selectors } from "../../conf";
import { notificate } from "../../dialogs";
import { askFile, loadConfiguration } from "../../export";
import { ModalWindow } from './ModalWindow';
import { checkAskFileResult, initReadedConf } from "../../utils";
import { getCurrentModal } from "./modalsRoot";

export class PickFileModal extends ModalWindow {
  static notSelectedFileTitle = '&lt;Not selected&gt;';

  constructor(filePath = '', projectConfigPath = '') {
    super();
    this.modal = $('');
    this.html = '';
    this.filePath = filePath;
    this.projectConfigPath = projectConfigPath;
  }
  render() {
    this.html = `
      <div class="modal pick-file" data-modal-type="start">
        <div class="close-modal">
          <i class="fa fa-times" aria-hidden="true"></i>
        </div>
        <div class="modal-head">
          <h2 class="modal-title">Pick File</h2>
          <button id="btn-pick-file-apply">Apply</button>
        </div>
        <div class="modal-content"></div>
      </div>
      `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderContent());



    return this;
  }
  renderContent() {
    const html = `
      <div class="list-wrap show">
        <ul class="list">
          <li>
            <label>UI Config</label>
            <span id="ui-config-path">${this.filePath ? this.filePath : '&lt;Not selected&gt;'}</span>
            <button id="open-project-config">Open file</button>
          </li>
          <li>
            <label>Project config file</label>
            <span id="project-config-path">${this.projectConfigPath ? this.projectConfigPath : PickFileModal.notSelectedFileTitle}</span>
            <button id="open-ui-dir">Open file</button>
          </li>
        </ul>
      </div>
      `;
    return html;
  }
  show() {
    super.show();
    document.querySelector('#btn-pick-file-apply')
      .addEventListener('click', PickFileModal.pickFileApply);
    document.querySelector('#open-project-config')
      .addEventListener('click', () => PickFileModal.pickFile('simple_ui', '#ui-config-path'));
    document.querySelector('#open-ui-dir')
      .addEventListener('click', PickFileModal.pickFile('project_config', '#project-config-path'));
  }
  static async pickFile(fileType, nodeId) {
    const result = await askFile(fileType);
    if (checkAskFileResult(result)) {
      $(nodeId).text(result.file_path);
    }
  }

  static async pickFileApply() {
    const notSelectedValue = '<Not selected>';
    const uiPath = $("#ui-config-path").text() === notSelectedValue
      ? null
      : $("#ui-config-path").text();
    const confPath = $("#project-config-path").text() === notSelectedValue
      ? null
      : $("#project-config-path").text();

    if (!uiPath) return;

    try {
      const conf = await loadConfiguration(uiPath);
      initReadedConf(conf, uiPath, confPath);
      localStorage.setItem('file-path', uiPath);

      if (confPath) {
        localStorage.configProjectPath = confPath;
        localStorage.currentUploadHandlersMode = 'src';
      } else {
        localStorage.configProjectPath = '';
        localStorage.currentUploadHandlersMode = 'base64';
      }

      document.modal = getCurrentModal();
      document.modal.close();
    } catch (error) {
      notificate(error, 'danger');
    }
  }
}
