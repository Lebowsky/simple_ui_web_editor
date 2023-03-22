function notificate(text, type) {
    $.toast(text, {sticky: false, type: type});
    console.log(text)
};

async function pick_file() {
	await eel.ask_file('simple_ui')().then(async (result) => {
		if (result == null)
			return
		
		if (result.error != undefined){
			notificate('Ошибка чтения файла: ' + result.error)
			console.log(JSON.parse(result.message))
			return
		};

		filePath = result.file_path;

		await eel.load_configuration(filePath)().then(conf => {
			$(".hidden-conf-json").text(JSON.stringify(conf));
			main.conf = conf;
			clearMainSection();
			fillDefaultValues();
			main.renderConfiguration();
			main.renderElementsList($(selectors.processList), "Process", "");
			main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
			main.renderElementsList($(selectors.pyFilesList), "PyFiles", "");
			$(".file-path").text(filePath);
            $('#preview-button').show();
            loadPrev();
		});
	});
}

async function pickHandlersFile(){
	if (!main.conf)
		return

	await eel.ask_file('python')().then(async (result) => {
		if (result == null){
			$('#py-handlers-file-path').text("Not selected")
			main.conf.ClientConfiguration.PyHandlers = ''
			return
		};

		if (result.error != undefined){
			notificate('Ошибка чтения файла: ' + result.error)
			console.log(JSON.parse(result.message))
			return
		};

		$('#py-handlers-file-path').text(result.file_path)

		base64_str = await eel.get_base64_from_file(result.file_path)()
		main.conf.ClientConfiguration.PyHandlers = base64_str
	});
};

async function pickNewFileProject() {
	await eel.ask_save_file('simple_ui')().then(async (result) => {
		console.log(result)
		filePath = result.file_path;
		if (filePath.trim() != ''){
			await eel.get_new_configuration()().then(conf => {
				$(".hidden-conf-json").text(JSON.stringify(conf));
				main.conf = conf;
				clearMainSection();
				fillDefaultValues();
				main.renderConfiguration();
				main.renderElementsList($(selectors.processList), "Process", "");
				main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
				
				$(".file-path").text(filePath);
                $('#preview-button').show()
            	loadPrev();
			});
		}
	});
}

const fileLocationSave = async (event) => {
    const data = main.conf;
    filePath = $('.file-path').text();
    result_save = await eel.save_configuration(data, filePath)();

	if (result_save.result == 'success') {
		conf = main.conf.ClientConfiguration
		pyHandlers = {}
		pyHandlersString = conf.PyHandlers

		if (pyHandlersString && pyHandlersString.length > 0)
			pyHandlers['current_handlers'] = pyHandlersString

		if (conf.PyFiles){
			$.each(conf.PyFiles, function(index, el){
				pyHandlers[el.PyFileKey] = el.PyFileData	
			});
		}

		await eel.save_handlers_file(pyHandlers)

		notificate('Файл успешно сохранен', 'success')
		loadPrev();
	}else{
		notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
	};
};

const showQRSettings = async (event) => {
    let img = $("#qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

    modal = addModal('qr', '', '');
    modal.append("<img src='"+img_src+"'>");
}
