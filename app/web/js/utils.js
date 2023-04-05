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

    const filePath = $('.file-path').text();

	let handlers = await fillBase64Handlers();
	saveConfFiles(main.conf, filePath, handlers)
}

async function saveConfFiles(conf, filePath, pyHandlers){
    let result_save = await saveConf(conf, filePath)
    let result_check = checkSaveFileResult(result_save)

    if (result_check){
        result_save = await savePyHandlers(pyHandlers)
        result_check = checkSaveFileResult(result_save)
    }

    if (! result_check)
        notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger') 
    else
        notificate('Файл успешно сохранен', 'success')
        loadPrev();

    return result_check
}

async function fillBase64Handlers(){
    let result = null;
    const filePath = $('#py-handlers-file-path').attr('data-path');
    const conf = main.conf.ClientConfiguration;

    if (filePath.length > 0){
        result = await getBase64FromFilePath(filePath);
    }

    if (result != null && result.length > 0){
        conf.PyHandlers = result;
		main.saveElement(getSaveParamValueById('py-handlers-file-path', 'path'), "Configuration", "");
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
    main.conf = conf;
    clearMainSection();
    fillSelectElementsOptions();
    fillDefaultValues();
    fillConfigSettings();

    main.renderConfiguration();
    main.renderElementsList($(selectors.processList), "Process", "");
    main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
    main.renderElementsList($(selectors.pyFilesList), "PyFiles", "");

    $(".file-path").text(filePath);
    $('#preview-button').show();

    let pyHandlersPath = getConfParamValue('pyHandlersPath')
    if (pyHandlersPath.length > 0){
        $('#py-handlers-file-path').text(pyHandlersPath)
    }else{
        $('#py-handlers-file-path').text(constants.pyHandlersEmptyPath)
    }
    $('#py-handlers-file-path').attr('data-path', pyHandlersPath)

    loadPrev();
}

function fillSelectElementsOptions(){
    $.each(main.elementParams.ClientConfiguration, function(key, value){
        if (value.type == 'select'){
            selectNode = $('#' + key)
            selectNode.empty()
            $.each(value.options, function (index, option) {
                selectNode.append($('<option>', {
                    value: option,
                    text: option
                }));
            })
        }
    });
}

function fillConfigSettings(){
    let settings = main.conf.ClientConfiguration.ConfigurationSettings;

    try {
        if (typeof settings.vendor_auth != 'undefined' && settings.vendor_auth.length > 0){
            let auth_array = decodeURIComponent(atob(settings.vendor_auth.split(' ')[1])).split(':')
            $('#vendor-login').val(auth_array[0])
            $('#vendor-password').val(auth_array[1])
        }else{
            $('#vendor-login').val('')
            $('#vendor-password').val('')    
        };

        if (typeof settings.handler_auth != 'undefined' && settings.handler_auth.length > 0){
            let auth_array = decodeURIComponent(atob(settings.handler_auth.split(' ')[1])).split(':')
            $('#handlers-login').val(auth_array[0])
            $('#handlers-password').val(auth_array[1])    
        }else{
            $('#handlers-login').val('')
            $('#handlers-password').val('')    
        }
    } catch (error) {
        console.log(error)    
    }
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
