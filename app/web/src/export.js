import { elementParams } from "./data/elementParams"
import { newConfiguration } from './data/newConfig'
import { qrSettings } from "./data/qrSettings"
import { qrConfigs } from "./data/qrConfigs";
import { base64data } from "./data/base64data";
import { data } from "jquery";
import { fullConfigData } from "./data/fullConfigData";
// eel.expose(getCurrentFilePath);
// function getCurrentFilePath() {
//   result = $(".file-path").text();
//   return result;
// };

// eel.expose(setDeviceHost);
// function setDeviceHost(deviceHost) {
//   document.main.settings.deviceHost = deviceHost;
//   updateDeviceHost();
// }

// eel.expose(getConfiguration);
// function getConfiguration() {
//   config = document.main.configGraph.getConfig();
//   return config
// }

// eel.expose(getConfigProjectPath);
// function getConfigProjectPath() {
//   return localStorage.currentUploadHandlersMode === 'src' ? localStorage.configProjectPath : ''
// }

// eel.expose(sendNotify)
// function sendNotify(text, type) {
//   notificate(text, type)
// }

export const getQRByteArrayAsBase64 = async () => {
  return qrSettings
  //   result = await eel.get_qr_settings()();
  //   return result
};

export const getQrConfigs = async () => {
  return qrConfigs
  //   result = await eel.get_qr_configs()();
  //   return result
}

export async function setConfigUIElements() {
  // result = await eel.get_config_ui_elements()();
  document.main.elementParams = elementParams
};

export async function askFile(fileType) {
  return {
    file_path: 'D:/test/test.ui',
    file_name: 'test.ui'
  }
  //   return eel.ask_file(fileType)();
};

export async function askDir() {
  return {
    path: 'D:/projects/simple UI/la-simple-keep'
  }
  //   return eel.ask_dir()();
};

// async function getProjectConfig(configData) {
//   return eel.get_project_config(configData)();
// }

export async function askSaveFile() {
  return {
    "file_path": "D:/test/test.ui"
  }
  // return eel.ask_save_file('simple_ui')();
};

export async function loadConfiguration(filePath) {
  return fullConfigData
  //   return eel.load_configuration(filePath)();
}

export async function getNewConfiguration() {
  //   return await eel.get_new_configuration()();
  return fullConfigData
}

export async function saveConf(data, filePath) {
  return { result: 'success' }
  //   return await eel.save_configuration(
  //     data,
  //     filePath,
  //     localStorage.currentUploadHandlersMode === 'src' ? localStorage.configProjectPath : ''
  //   )();
}

export async function savePyHandlers(pyHandlers, path) {
  return { result: 'success' }
  //   return await eel.save_handlers_files(pyHandlers, path)();
}

export async function getBase64FromFilePath(filePath) {
  return base64data
  //   return await eel.get_base64_from_file(filePath)()
}

export function getBase64FromFilePathsList(filesList) {
  return base64data
  // return await eel.get_base64_from_files_list(filesList)()
}

export async function sendSqlQueryToDevice(query_params) {
  return {
    data: {
      header: '1|2|3',
      data: ['1|2|3']
    }
  }

  //   return await eel.send_sql_query(query_params)()
}

export async function sendRequestToDevice(req_params) {
  return { data: {} }
  // return await eel.send_request(req_params)()
}

export async function exportData(uiPath, dirToSave) {
  return { 'result': true }
  // return await eel.export_data(uiPath, dirToSave)()
}