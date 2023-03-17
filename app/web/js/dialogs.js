function notificate(text, type) {
    $.toast(text, {sticky: false, type: type});
    console.log(text)
};

async function pick_file() {
	await eel.ask_file('simple_ui')().then(async (result) => {
		filePath = result.file_path;

		await eel.load_configuration(filePath)().then(conf => {
			$(".hidden-conf-json").text(JSON.stringify(conf));
			main.conf = conf;
			clearMainSection();
			main.renderConfiguration();
			main.renderElementsList($(selectors.processList), "Process", "");
			main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
			$(".file-path").text(filePath);
            $('#preview-button').show();
            loadPrev();
		});
	});
}

async function pickNewFileProject() {
	await eel.ask_save_file('simple_ui')().then(async (result) => {
		filePath = result.file_path;
		if (filePath.trim() != ''){
			await eel.get_new_configuration()().then(conf => {
				$(".hidden-conf-json").text(JSON.stringify(conf));
				main.conf = conf;
				clearMainSection();
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
		notificate('Файл успешно сохранен', 'success')
		loadPrev();
	}else{
		notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
	}
};

const showQRSettings = async (event) => {
    let img = $("#qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

    modal = addModal('qr', '', '');
    modal.append("<img src='"+img_src+"'>");
}
