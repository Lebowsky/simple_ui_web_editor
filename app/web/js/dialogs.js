function notificate(text, type) {
    $.toast(text, {sticky: false, type: type});
    console.log(text)
};

async function pickFile(file_type='') {
	let result = await askFile(file_type);
	if (checkAskFileResult(result)){
		// if (file_type == 'simple_ui') {
		// 	conf = await loadConfiguration(result.file_path);
		// 	initReadedConf(conf, result.file_path);
		// 	localStorage.setItem('file-path', result.file_path);
		if (file_type == 'python') {
			$("#file_path").val(result.file_path);
			$("#PyFileKey").val(result.file_name  ? result.file_name.split('.py')[0] : '');
			$("#file_name").val(result.file_name);
		}
	};
};

async function pickUiConfig(){
	let result = await askFile('simple_ui');	
	if (checkAskFileResult(result)){
		const emptyText = "<Not selected>";
		const filePath = result.file_path;
		const workdir = $("#working-dir-path").val() || result.workdir;
		const projectConfig = $("#project-config-path").val() || result.project_config;

		$("#ui-config-path").text(filePath);
		$("#working-dir-path").text(workdir ? workdir : emptyText);
		$("#working-dir-path").val(workdir);
		$("#project-config-path").text(projectConfig ? projectConfig : emptyText);
		$("#project-config-path").val(projectConfig);
		
		// localStorage.setItem('file-path', result.file_path);
	};
};

async function pickWorkingDir(){
	const resultAsk = await askDir();
	if (resultAsk && resultAsk.path){
		$('#working-dir-path').text(resultAsk.path);
		$("#working-dir-path").val(resultAsk.path);	
	};
};

async function pickProjectConfig(){
	let result = await askFile('project_config');
	if (checkAskFileResult(result)){
		$("#project-config-path").text(result.file_path);
		$("#project-config-path").val(result.file_path);	
	};
};

async function pickNewFileProject() {
	let result = await askSaveFile()
	if (checkAskFileResult(result)){
		conf = await getNewConfiguration()
		initReadedConf(conf, result.file_path)
		localStorage.setItem('file-path', result.file_path);
		return result.file_path;
	}
}

const fileLocationSave = async (event) => {	
	modals = ModalWindow.getModals();
	$.each(modals, (index, modal) => {
		main.configGraph.setConfigValues(modal.element.id, modal.getValues());
	})
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

// async function pickWorkingDir(){
// 	const resultAsk = await askDir();

// 	if (resultAsk && resultAsk.path){
// 		$('#working-dir-path').text(resultAsk.path);
// 		$('.dir-path').text(resultAsk.path);
// 		main.settings.dirPath = resultAsk.path;
// 		const projectConfigPath = $('#project-config-path').text() || `${resultAsk.path}\sui_config.json`;

// 		const configData = {
// 			workDir: resultAsk.path,
// 			filePath: projectConfigPath,
// 			PyHandlers : main.conf.ClientConfiguration['PyHandlers'] || '',
// 			PyFiles : main.conf.ClientConfiguration['PyFiles'] || [],
// 			Mediafile : main.conf.ClientConfiguration['Mediafile'] || []
// 		}
// 		const projectConfig = getProjectConfig(configData);
// 		// if (resultCheck && !resultAsk.error){
// 		// 	$('#project-config-path').text(resultAsk.file_path);
// 		// }
// 	}
// };

async function pickProjectConfigFile(){
	if (! main.conf)
		return

	
};

const showQRSettings = async (event) => {
    let img = $("#qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

	modal = new ImageModal();
	modal.render();
	modal.modal.append(`<img id="qr-code" src="${img_src}">`);
	modal.show();
}

const showSqlQueries = async(event) => {
	modal = new SQLQueryModal(main.settings.deviceHost);
	modal.render();
	modal.show();
}

const showSendRequest = async(event) => {
	modal = new SendReqModal(main.settings.deviceHost);
	modal.render();
	modal.show();
}

const showAuth = async(event) => {
	modal = new AuthModal();
	modal.render();
	modal.show();
}

const showPickFile = async(event) => {
	modal = new PickFileModal(main.settings.filePath, main.settings.dirPath);
	modal.render();
	modal.show();
}

const showSearchElements = async(event) => {
	modal = new SearchElementsModal();
	modal.render();
	modal.show();
}