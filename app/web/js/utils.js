function checkAskFileResult(answer) {
  result = false

  if (answer == null) {
    result = false

  } else if (typeof answer.error != 'undefined') {
    if (answer.error == 'VersionError' &&
      confirm('Выбранный файл будет преобразован в новый формат. Продолжить?')) {
      result = true
    } else {
      notificate('Ошибка чтения файла: ' + answer.error)
      console.log(JSON.parse(answer.message))
    };
  } else if (typeof answer.file_path != 'undefined') {
    result = true;
  } else {
    notificate('Ошибка выполнения команды чтения файла');
  };

  return result;
}
function checkSaveFileResult(answer) {
  let result = false

  if (answer != null && answer.result == 'success')
    result = true
  else if (answer != null && typeof answer.msg != 'undefined') {
    notificate('Ошибка сохранения файла')
    console.error(answer.msg)
  }

  return result
}
async function saveConfiguration(pathToSave=null) {
  if (typeof main.conf == 'undefined')
    return;

  let filePath = pathToSave || localStorage.getItem('file-path');

  if (!filePath) {
    filePath = await pickNewFileProject(main);
    if (!filePath)
      return;
  }

  main.conf = main.configGraph.getConfig();
  await fillBase64Handlers();
  await fillBase64Mediafiles()
  saveConfFiles(main.conf, filePath)
}
async function buildConfiguration() {
  return main.configGraph.getConfig()
}
async function saveConfFiles(conf, filePath) {
  let result_save = await saveConf(conf, filePath)
  let result_check = checkSaveFileResult(result_save)

  if (!result_check)
    notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
  else
    notificate('Файл успешно сохранен', 'success')
  main.loadPrev();

  return result_check
}
async function saveAllPyFilesToDisk() {
  const result = await askDir();
  if (!result)
    return

  const dirToSave = result.path;

  let handlers = await fillBase64Handlers();

  result_save = await savePyHandlers(handlers, dirToSave)
  result_check = checkSaveFileResult(result_save)

  if (!result_check)
    notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
  else
    notificate('Файл успешно сохранен', 'success')
  main.loadPrev();
}

async function fillBase64Handlers() {
  let result = null;
  const filePath = $('#py-handlers-file-path').attr('data-path');
  const conf = main.conf.ClientConfiguration;

  if (filePath.length > 0) {
    result = await getBase64FromFilePath(filePath);
  }

  if (result?.length > 0) {
    conf.pyHandlersPath = filePath;
    conf.PyHandlers = result;
  } else {
    conf.pyHandlersPath = ''
  };

  if (conf.PyFiles) {
    const filesList = conf.PyFiles.filter(el => el.file_path).map(el => (el.file_path))
    const filesData = await getBase64FromFilePathsList(filesList)

    conf.PyFiles = conf.PyFiles.map(
      el => ({
        ...el, 
        ...{PyFileData: filesData[[el.file_path]] || el.PyFileData}
      })
    )
  }
}

async function fillBase64Mediafiles() {
  const conf = main.conf.ClientConfiguration;
  if (conf.Mediafile) {
    const filesList = conf.Mediafile.filter(el => el.file_path).map(el => (el.file_path))
    const filesData = await getBase64FromFilePathsList(filesList)

    conf.Mediafile = conf.Mediafile.map(
      el => ({
        ...el, 
        ...{MediafileData: filesData[[el.file_path]] || el.MediafileData}
      })
    )
  }
}

function initReadedConf(conf, filePath, configProjectPath = '') {
  main.initUIConf(conf, filePath, configProjectPath);
}

function getSaveParamValueById(id, valueParamName) {
  let filePathElement = $('#' + id)
  let paramName = filePathElement.attr("data-param-name");
  let paramValue = filePathElement.attr('data-' + valueParamName);
  let params = {};
  params[paramName] = paramValue;

  return params
}

function getConfParamValue(paramName, def = '') {
  let paramValue = main.conf.ClientConfiguration[paramName]
  if (typeof paramValue == 'undefined')
    return def
  else
    return paramValue
}

function debug(msg) {
  if (main.debug) {
    console.debug(msg);
  }
}

function updateDeviceHost() {
  const query_modal = $('.modal.sql-query.active')
  const req_modal = $('modal.send-req active')
  if (main.settings.deviceHost && (query_modal.length || req_modal.length)) {
    query_modal.find('#ip-address').val(main.settings.deviceHost)
    req_modal.find('#ip-address').val(main.settings.deviceHost)
  }
}
