function notificate(text, type) {
    $.toast(text, {sticky: false, type: type});
    console.log(text)
};

async function pickFile() {
	let result = await askFile('simple_ui');
	if (checkAskFileResult(result)){
		conf = await loadConfiguration(result.file_path);
		initReadedConf(conf, result.file_path);
	};
};

async function pickNewFileProject() {
	let result = await askSaveFile()
	if (checkAskFileResult(result)){
		conf = await getNewConfiguration()
		initReadedConf(conf, result.file_path)
	}
}

const fileLocationSave = async (event) => {
	saveConfiguration();
}; 

async function pickHandlersFile(){
	if (! main.conf)
		return

	let filePathText = constants.pyHandlersEmptyPath;
	resultAsk = await askFile('python');
	
	if (checkAskFileResult(resultAsk)){
		filePathText = resultAsk.file_path;
		$('#py-handlers-file-path').attr('data-path', filePathText);
	}else{
		$('#py-handlers-file-path').attr('data-path', '');
	}

	$('#py-handlers-file-path').text(filePathText);
};

async function pickWorkingDir(){
	if (! main.conf)
		return

	const resultAsk = await askDir();

	if (resultAsk && resultAsk.path){
		$('#working-dir-path').text(resultAsk.path);
		const projectConfigPath = $('#project-config-path').text() || `${resultAsk.path}\sui_config.json`

		const configData = {
			workDir: resultAsk.path,
			filePath: projectConfigPath,
			PyHandlers : main.conf.ClientConfiguration['PyHandlers'] || '',
			PyFiles : main.conf.ClientConfiguration['PyFiles'] || [],
			Mediafile : main.conf.ClientConfiguration['Mediafile'] || []
		}
		const projectConfig = getProjectConfig(configData);
		// if (resultCheck && !resultAsk.error){
		// 	$('#project-config-path').text(resultAsk.file_path);
		// }
	}
};

async function pickProjectConfigFile(){
	if (! main.conf)
		return

	
};

const showQRSettings = async (event) => {
    let img = $("#qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

    // modal = addModal('qr', '', '');
    
	modal = new ImageModal();
	modal.render();
	modal.modal.append("<img src='"+img_src+"'>");
	modal.show();

}
