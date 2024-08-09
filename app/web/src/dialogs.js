import { askDir, askFile, askSaveFile, exportData, getQrConfigs } from './export'
import { AuthModal, ModalWindow, PickFileModal, QRImageModal, SearchElementsModal, SendReqModal, SQLQueryModal } from './renderElements';
import { checkAskFileResult, initReadedConf, saveConfiguration } from './utils';
import { getNewConfiguration } from './export';
import { constants } from './conf';

export function notificate(text, type) {
  /*
  type: [danger, info, success]
  */
  // $.toast(text, { sticky: false, type: type });
  console.log(text)
};

export async function pickNewFileProject() {
  let result = await askSaveFile()
  if (checkAskFileResult(result)) {
    const conf = await getNewConfiguration()
    initReadedConf(conf, result.file_path)
    localStorage.setItem('file-path', result.file_path);
    saveConfiguration()
    return result.file_path;
  }
}

export const fileLocationSave = async () => {
  const modals = ModalWindow.getModals();
  $.each(modals, (index, modal) => {
    document.main.configGraph.setConfigValues(modal.element.id, modal.getValues());
  })
  saveConfiguration();
};

export const fileLocationSaveAs = async () => {
  let result = await askSaveFile()
  if (checkAskFileResult(result)) {
    const modals = ModalWindow.getModals();
    $.each(modals, (index, modal) => {
      document.main.configGraph.setConfigValues(modal.element.id, modal.getValues());
    })

    const filePath = result.file_path
    localStorage.setItem('file-path', filePath)
    $(".file-path").text(filePath);
    document.main.settings.filePath = filePath
    await saveConfiguration(result.file_path);
  }
}
export const exportConfigData = async () => {
  const uiPath = localStorage.getItem('file-path')

  if (!uiPath) {
    notificate('Export failed: UI configuration must be saved', 'danger')
    return
  }

  const result = await askDir();
  if (!result)
    return

  const dirToSave = result.path;

  const resultExport = await exportData(uiPath, dirToSave)

  if (resultExport?.result === true)
    notificate('Export success', 'success')
  else
    notificate(`Export failed: ${resultExport?.error ? resultExport?.error : 'unknown error'}`, 'danger')
}

export async function pickHandlersFile() {
  if (!document.main.conf)
    return

  let filePathText = constants.pyHandlersEmptyPath;
  const resultAsk = await askFile('python');

  if (checkAskFileResult(resultAsk)) {
    filePathText = resultAsk.file_path;
    $('#py-handlers-file-path').attr('data-path', filePathText);
  } else {
    $('#py-handlers-file-path').attr('data-path', '');
  }

  $('#py-handlers-file-path').text(filePathText);
};

export const showQRSettings = async (event) => {
  const settings = await getQrConfigs()
  if (!settings) return

  const hostsOptions = settings.map((el, idx) => ({
    value: `host${idx}`,
    option: el.host,
    imgSrc: `data:image/png;base64, ${el.image}`
  })
  )

  let uploadModesOptions = [{ value: 'base64', option: 'Base64' }]
  if (localStorage.configProjectPath) {
    uploadModesOptions = [
      { value: 'src', option: 'Sources' },
      ...uploadModesOptions
    ]
  }

  document.modal = new QRImageModal({ hostsOptions, uploadModesOptions });
  document.modal.render();
  document.modal.show();
}

export const showSqlQueries = async (event) => {
  document.modal = new SQLQueryModal(document.main.settings.deviceHost);
  document.modal.render();
  document.modal.show();
}

const showSendRequest = async (event) => {
  document.modal = new SendReqModal(document.main.settings.deviceHost);
  document.modal.render();
  document.modal.show();
}

const showAuth = async (event) => {
  document.modal = new AuthModal();
  document.modal.render();
  document.modal.show();
}

export const showPickFileModal = async (event) => {
  document.modal = new PickFileModal(
    document.main.settings.filePath,
    document.main.settings.configProjectPath
  );
  document.modal.render();
  document.modal.show();
}

export const showSearchElements = async (event) => {
  document.modal = new SearchElementsModal();
  document.modal.render();
  document.modal.show();
  $('#search').focus()
}