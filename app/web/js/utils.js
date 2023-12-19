function checkAskFileResult(answer){
    result = false
    
    if (answer == null){
        result = false   

    }else if (typeof answer.error != 'undefined'){
        if (answer.error == 'VersionError' && 
            confirm('Выбранный файл будет преобразован в новый формат. Продолжить?')){
            result = true
        }else{
            notificate('Ошибка чтения файла: ' + answer.error)
            console.log(JSON.parse(answer.message))
        };
	}else if (typeof answer.file_path != 'undefined'){
        result = true;
	}else{
		notificate('Ошибка выполнения команды чтения файла');
	};

    return result;
}
function checkSaveFileResult(answer){
    let result = false
    
    if (answer != null && answer.result == 'success')
        result = true
    else if (answer != null && typeof answer.msg != 'undefined'){
        notificate('Ошибка сохранения файла') 
        console.error(answer.msg)
    }

    return result
}
async function saveConfiguration(){
    if (typeof main.conf == 'undefined')
        return;

    let filePath = localStorage.getItem('file-path');

    if (!filePath) {
        filePath = await pickNewFileProject(main);
        if (!filePath)
            return;
    }

    main.conf = main.configGraph.getConfig();
    const workingDirValue = $('#working-dir-path').text();

    const workingDir = workingDirValue == '<Not selected>' ? '' : workingDirValue

	let handlers = await fillBase64Data();
	if (saveConfFiles(main.conf, filePath, workingDir, handlers)){
        //main.configGraph = new ClientConfiguration(main.conf.ClientConfiguration);
    }
}
async function buildConfiguration(){
    return main.configGraph.getConfig()
}
async function saveConfFiles(conf, filePath, workingDir, pyHandlers){
    let result_save = await saveConf(conf, filePath, workingDir)
    let result_check = checkSaveFileResult(result_save)

    //TODO Функционал сохренения всех base64 файлов перенести в отдельную команду глобального меню 
    // if (result_check){
        // result_save = await savePyHandlers(pyHandlers, workingDir)
        // result_check = checkSaveFileResult(result_save)
    // }

    if (! result_check)
        notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
    else
        notificate('Файл успешно сохранен', 'success')
        main.loadPrev();

    return result_check
}
async function fillBase64Data(){
    let result = null;
    const filePath = $('#py-handlers-file-path').attr('data-path');
    const conf = main.conf.ClientConfiguration;

    if (filePath.length > 0){
        result = await getBase64FromFilePath(filePath);
    }

    if (result != null && result.length > 0){
        conf.PyHandlers = result;
		// main.saveElement(getSaveParamValueById('py-handlers-file-path', 'path'), "Configuration", "");
    }else{
        conf.pyHandlersPath = ''
    };

    if (typeof conf.PyFiles != 'undefined'){

        for (i=0; i < conf.PyFiles.length; i++){
            row = conf.PyFiles[i]
            result = await getBase64FromFilePath(row.file_path);
            if (result != null && result.length > 0){
                row.PyFileData = result;
            }
        }
    }
    return getHandlers()
}
function getHandlers(){
    let handlers = {};
    const conf = main.conf.ClientConfiguration;

    if (typeof conf.PyHandlers != 'undefined' && conf.PyHandlers.length > 0){
        handlers['current_handlers'] = conf.PyHandlers;
    };

    if (typeof conf.PyFiles != 'undefined'){
        $.each(conf.PyFiles, async function(index, row){
            if (row.PyFileData.length > 0){
                handlers[row.PyFileKey] = row.PyFileData;
            };
        });
    };
    return handlers;
}
function initReadedConf(conf, filePath){
    main.initUIConf(conf, filePath);
}

function getSaveParamValueById(id, valueParamName){
    let filePathElement = $('#'+id)
    let paramName = filePathElement.attr("data-param-name");
    let paramValue = filePathElement.attr('data-' + valueParamName);
    let params = {};
    params[paramName] = paramValue;
    
    return params
}

function getConfParamValue(paramName, def=''){
    let paramValue = main.conf.ClientConfiguration[paramName]
    if (typeof paramValue == 'undefined')
        return def
    else
        return paramValue
}

function debug(msg){
    if (main.debug){
        console.debug(msg);
    }
}

function updateDeviceHost(){
    const query_modal = $('.modal.sql-query.active')
    const req_modal = $('modal.send-req active')
    if (main.settings.deviceHost && (query_modal.length || req_modal.length)){
        query_modal.find('#ip-address').val(main.settings.deviceHost)
        req_modal.find('#ip-address').val(main.settings.deviceHost)
    }

    

    
}
