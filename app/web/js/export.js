function exportConfig () {
	let configJson = $(".hidden-conf-json").text();

	return configJson;
}

eel.expose(getCurrentFilePath);
function getCurrentFilePath(){
    result = $(".file-path").text();
    return result;
};

const getQRByteArrayAsBase64 = async () => {
    result = await eel.get_qr_settings()();
    return result
};

async function get_config_ui_elements() {
	await eel.get_config_ui_elements()().then(async (result) => {
		console.log(result)
		main.elementParams = result;
	});
}