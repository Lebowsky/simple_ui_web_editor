eel.expose(getCurrentFilePath);
function getCurrentFilePath(){
    result = $(".file-path").text();
    return result;
};

const getQRByteArrayAsBase64 = async () => {
    result = await eel.get_qr_settings()();
    return result
};

async function setConfigUIElements() {
	result = await eel.get_config_ui_elements()();
	console.log(result)
	main.elementParams = result
};

async function askFile(file_type) {
	return eel.ask_file(file_type)();
};

async function askSaveFile() {
	return eel.ask_save_file('simple_ui')();
};

async function loadConfiguration(filePath){
	return eel.load_configuration(filePath)();
}

async function getNewConfiguration(){
	return await eel.get_new_configuration()();
}

async function saveConf(data, filePath){
	return await eel.save_configuration(data, filePath)();
}

async function savePyHandlers(pyHandlers){
	return await eel.save_handlers_files(pyHandlers)();
}

async function getBase64FromFilePath(filePath){
	return await eel.get_base64_from_file(filePath)()
}
