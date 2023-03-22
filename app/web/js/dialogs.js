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
	if (typeof main.conf == 'undefined')
        return 

    const filePath = $('.file-path').text();

	let handlers = await fillBase64Handlers()
	if (saveConfFiles(main.conf, filePath, handlers))
		loadPrev()
}; 

async function pickHandlersFile(){
	if (! main.conf)
		return

	let filePathText = 'Not selected'
	resultAsk = await askFile('python')
	
	if (checkAskFileResult(resultAsk)){
		filePathText = resultAsk.file_path
	}

	$('#py-handlers-file-path').text(filePathText)
};

const showQRSettings = async (event) => {
    let img = $("#qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

    modal = addModal('qr', '', '');
    modal.append("<img src='"+img_src+"'>");
}
