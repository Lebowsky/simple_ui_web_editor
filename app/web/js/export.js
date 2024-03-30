eel.expose(getCurrentFilePath);
function getCurrentFilePath(){
    result = $(".file-path").text();
    return result;
};

eel.expose(setDeviceHost);
function setDeviceHost(deviceHost){
	main.settings.deviceHost = deviceHost;
	updateDeviceHost();
}

eel.expose(getConfiguration);
function getConfiguration(){
	config = main.configGraph.getConfig();
	return config
}
const getQRByteArrayAsBase64 = async () => {
    result = await eel.get_qr_settings()();
    return result
};

async function setConfigUIElements() {
	result = await eel.get_config_ui_elements()();
	main.elementParams = result
};

async function askFile(file_type) {
	return eel.ask_file(file_type)();
};

async function askDir() {
	return eel.ask_dir()();
};

async function getProjectConfig(configData){
	return eel.get_project_config(configData)();
}

async function askSaveFile() {
	return eel.ask_save_file('simple_ui')();
};

async function loadConfiguration(filePath){
	return eel.load_configuration(filePath)();
}

async function getNewConfiguration(){
	return await eel.get_new_configuration()();
}

async function saveConf(data, filePath, workingDir){
	return await eel.save_configuration(data, filePath, workingDir)();
}

async function savePyHandlers(pyHandlers, workingDir){
	return await eel.save_handlers_files(pyHandlers, workingDir)();
}

async function getBase64FromFilePath(filePath){
	return await eel.get_base64_from_file(filePath)()
}

async function sendSqlQueryToDevice(query_params){
	return await eel.send_sql_query(query_params)()
}

async function sendRequestToDevice(req_params){
	return await eel.send_request(req_params)()
}