function notificate(text, type) {
  $.toast(text, { sticky: false, type: type });
  console.log(text)
};

async function pickFile(file_type) {
  let result = await askFile(file_type);
  if (checkAskFileResult(result)) {
    if (file_type == 'simple_ui') {
      conf = await loadConfiguration(result.file_path);
      initReadedConf(conf, result.file_path);
      localStorage.setItem('file-path', result.file_path);
    } else if (file_type == 'python') {
      $("#file_path").val(result.file_path);
      $("#PyFileKey").val(result.file_name);
    }
  };
};

async function pickNewFileProject() {
  let result = await askSaveFile()
  if (checkAskFileResult(result)) {
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

const fileLocationSaveAs = async () => {
  console.log('save as')
}
const exportConfigData = async () => {
  console.log('export');
}

async function pickHandlersFile() {
  if (!main.conf)
    return

  let filePathText = constants.pyHandlersEmptyPath;
  resultAsk = await askFile('python');

  if (checkAskFileResult(resultAsk)) {
    filePathText = resultAsk.file_path;
    $('#py-handlers-file-path').attr('data-path', filePathText);
  } else {
    $('#py-handlers-file-path').attr('data-path', '');
  }

  $('#py-handlers-file-path').text(filePathText);
};

async function pickProjectConfigFile() {
  let result = await askFile('project_config');

  if (checkAskFileResult(result)) {
    let filePath = result.file_path
    localStorage.setItem('configProjectPath', filePath);
    main.settings.configProjectPath = filePath
    $("#ui-config-path").text(filePath);
  }
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

const showSqlQueries = async (event) => {
  modal = new SQLQueryModal(main.settings.deviceHost);
  modal.render();
  modal.show();
}

const showSendRequest = async (event) => {
  modal = new SendReqModal(main.settings.deviceHost);
  modal.render();
  modal.show();
}

const showAuth = async (event) => {
  modal = new AuthModal();
  modal.render();
  modal.show();
}

const showPickFile = async (event) => {
  modal = new PickFileModal(
    main.settings.filePath,
    main.settings.dirPath,
    main.settings.configProjectPath
  );
  modal.render();
  modal.show();
}

const showSearchElements = async (event) => {
  modal = new SearchElementsModal();
  modal.render();
  modal.show();
  $('#search').focus()
}