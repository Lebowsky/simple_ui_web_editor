function exportConfig () {
	let configJson = $(".hidden-conf-json").text();

	return configJson;
}


eel.expose(getCurrentFilePath);
function getCurrentFilePath(){
    result = $(".file-path").text();
    return result;
};