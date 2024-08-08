import { elementParams } from "./data/elementParams"
import {newConfiguration} from './data/newConfig'
// eel.expose(getCurrentFilePath);
// function getCurrentFilePath() {
//   result = $(".file-path").text();
//   return result;
// };

// eel.expose(setDeviceHost);
// function setDeviceHost(deviceHost) {
//   main.settings.deviceHost = deviceHost;
//   updateDeviceHost();
// }

// eel.expose(getConfiguration);
// function getConfiguration() {
//   config = main.configGraph.getConfig();
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

// const getQRByteArrayAsBase64 = async () => {
//   result = await eel.get_qr_settings()();
//   return result
// };

// const getQrConfigs = async () => {
//   result = await eel.get_qr_configs()();
//   return result
// }

export async function setConfigUIElements() {
  // result = await eel.get_config_ui_elements()();
  document.main.elementParams = elementParams
};

export async function askFile(fileType) {
//   return eel.ask_file(fileType)();
};

// async function askDir() {
//   return eel.ask_dir()();
// };

// async function getProjectConfig(configData) {
//   return eel.get_project_config(configData)();
// }

export async function askSaveFile() {
  return eel.ask_save_file('simple_ui')();
};

// async function loadConfiguration(filePath) {
//   return eel.load_configuration(filePath)();
// }

export async function getNewConfiguration() {
//   return await eel.get_new_configuration()();
  return newConfiguration
}

// async function saveConf(data, filePath) {
//   return await eel.save_configuration(
//     data, 
//     filePath, 
//     localStorage.currentUploadHandlersMode === 'src' ? localStorage.configProjectPath : ''
//   )();
// }

// async function savePyHandlers(pyHandlers, path) {
//   return await eel.save_handlers_files(pyHandlers, path)();
// }

// async function getBase64FromFilePath(filePath) {
//   return await eel.get_base64_from_file(filePath)()
// }

// async function getBase64FromFilePathsList(filesList) {
//   return await eel.get_base64_from_files_list(filesList)()
// }

// async function sendSqlQueryToDevice(query_params) {
//   return await eel.send_sql_query(query_params)()
// }

// async function sendRequestToDevice(req_params) {
//   return await eel.send_request(req_params)()
// }

// async function exportData(uiPath, dirToSave){
//   return await eel.export_data(uiPath, dirToSave)()
// }