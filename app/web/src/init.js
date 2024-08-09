import $ from 'jquery'
import { sortable } from 'webpack-jquery-ui'

import { ListElement } from './components/modals/ListElement'
import { ElementModal } from './components/modals/ElementModal'
import { JsonModal } from './components/modals/JsonModal'
import { SelectTypeModal } from './components/modals/SelectTypeModal'
import { Main } from './main'
import { selectors, keys, listElements } from './conf'
import { setConfigUIElements, getNewConfiguration, loadConfiguration } from './export'
import { initReadedConf } from './utils'
import { sortableInit, togglePrev } from './handlers';
import { 
  pickNewFileProject, 
  showPickFileModal,
  fileLocationSave,
  fileLocationSaveAs,
  exportConfigData,
  showQRSettings,
  showSqlQueries,
  showSearchElements,
  notificate,
  pickHandlersFile
} from './dialogs'
import { getCurrentModal } from './components/modals/modalsRoot'



document.main = Object.create(Main);
setConfigUIElements();

$(document).ready(function () {
  sortableInit(selectors.list);
  document.main.settings.modalWidth = 820;

  const filePath = localStorage.getItem('file-path');

  localStorage.currentUploadHandlersMode = localStorage.currentUploadHandlersMode || 'base64'

  if (!filePath) {
    newFile();
  } else {
    readFile(filePath);
  }
  async function newFile() {
    const conf = await getNewConfiguration()
    initReadedConf(conf)
  }
  async function readFile(filePath) {
    const conf = await loadConfiguration(filePath);
    initReadedConf(conf, filePath);
  }
  $('#prev').resizable({
    minWidth: 250,
    handles: "e,w",
    start: function (event, ui) {
      $('iframe').css('pointer-events', 'none');
    },
    stop: function (event, ui) {
      $('iframe').css('pointer-events', 'auto');
    }
  });
  $(document).on('keyup', "#search", function (e) {
    const q = $(this).val();
    let elements = [];
    let listItems = [];
    const node = $("#search-result-wrap");

    if (q != "") {
      elements = document.main.configGraph.elements.filter(element =>
        String(element.elementValues.Value).toLowerCase().includes(q.toLowerCase()) ||
        String(element.elementValues.Variable).toLowerCase().includes(q.toLowerCase()) ||
        String(element.elementValues.alias).toLowerCase().includes(q.toLowerCase()) ||
        String(element.elementValues.method).toLowerCase().includes(q.toLowerCase())
      );
    }

    if (elements.length > 0) {
      elements.forEach((item) => {
        let name = item.elementValues[item.parentConfig.rowKeys.filter(key => item.elementValues[key])[0]];
        let value = Object.keys(item.elementValues).find((el) => ['Value', 'method'].includes(el));
        let itemClasses = "";
        let path = document.main.configGraph.getElementPath(item.id);
        name = name || item.elementValues['type'];

        if (value)
          value = item.elementValues[[value]]

        if (item.elementValues.type == "CVOperation")
          itemClasses = "cv";

        listItems.push({
          name: name,
          value: value,
          id: item.id,
          itemClasses: itemClasses,
          path: path
        });
      })
    }

    const listElement = new ListElement(listItems, "Processes");

    listElement.render(false);

    $(node).siblings('.element-childs-wrap').html('');
    $(node).html(listElement.html);
  })
  $(document).on('click', selectors.btnEdit, function () {
    const elementId = $(this).parents(selectors.listItem).attr('data-id');
    editElement(elementId);
  })
  $(document).on('dblclick', selectors.itemNav, function (e) {
    if (e.target === this) {
      const elementId = $(this).parent(selectors.listItem).attr('data-id');

      const element = document.main.configGraph.getElementById(elementId);
      if (element?.parentType === 'Processes') return

      editElement(elementId);
    }
  })
  $(document).on('dblclick', selectors.listItem, function (e) {
    if (e.target === this) {
      const elementId = $(this).attr('data-id');
      editElement(elementId);
    }
  })
  $(document).on('click', '.path .element-path:not(:last-child)', function (e) {
    const elementId = $(this).attr('data-id');
    editElement(elementId);
  })
  $(document).on('change', "#ip-address", function () {
    document.main.settings.deviceHost = $(this).val();
  })
  $(document).on('click', selectors.btnDelete, function () {
    if (confirm('Вы уверены?')) {
      const elementId = $(this).parents(selectors.listItem).attr('data-id');
      const element = document.main.configGraph.getElementById(elementId);
      const type = element.parentType;
      const node = element.parentConfig['node'];
      const parentId = element.parentId;

      document.main.configGraph.removeElement(element);
      document.main.configGraph.fillListElements(type, node, parentId);

      if (element.parentType == "Operations" || element.parentType == "CVFrames") {
        const operationListNode = $(selectors.processList).find("#operations[data-id='" + parentId + "']")
        document.main.configGraph.fillListElements(element.parentType, operationListNode, parentId);
      }
    }
  })
  $(document).on('click', selectors.btnCopy, function (e) {
    const elementId = $(this).parents(selectors.listItem).attr('data-id');
    const elementConf = document.main.configGraph.getConfigElement(elementId);
    copyTextToClipboard(JSON.stringify(elementConf));
  })
  $(document).on('click', selectors.btnJson, function (e) {
    const elementId = $(this).parents(selectors.listItem).attr('data-id');
    const elementConf = document.main.configGraph.getConfigElement(elementId);

    const modal = new JsonModal(elementConf);
    modal.render();
    modal.show();
  })
  $(document).on('dblclick', ".sql-table tr", function (e) {
    const modal = getCurrentModal();
    const table = modal.modal.find('.sql-table').DataTable();
    const rowData = table.row(this).data();
    const data = {};

    table.columns().every(function (index) {
      var columnName = table.column(Number(index)).header().textContent;
      data[columnName] = rowData[index];
    });

    modal = new JsonModal(data);
    modal.render();
    modal.show();
  });
  $(document).on('click', ".show-sql-table-json", function (e) {
    let modal = getCurrentModal();
    const table = modal.modal.find('.sql-table').DataTable();
    const data = table.rows().data();
    const jsonData = [];

    data.each(function (valueArray) {
      var rowData = {};

      table.columns().every(function (index) {
        var columnName = table.column(Number(index)).header().textContent;
        rowData[columnName] = valueArray[index];
      });

      jsonData.push(rowData);
    });

    modal = new JsonModal(jsonData);
    modal.render();
    modal.show();
  })
  $(document).on('click', selectors.btnPaste, function (e) {
    const parentId = $(this).parents('.list').attr('data-id');
    const childrensType = $(this).attr('data-childrens-type');
    let elementConf

    navigator.clipboard.readText().then(function (text) {
      let parentType
      try {
        const text = text.replace(/:[ ]*False/g, ':false').replace(/:[ ]*True/g, ':true');
        const elementConf = JSON.parse(text);
      } catch (error) {
        notificate('Элемент не найден в буфере');
        return
      }

      if (elementConf.type == "Process")
        parentType = "Processes";
      else if (elementConf.type == "Operation")
        parentType = "Operations";
      else if (elementConf.type == "CVFrame")
        parentType = "CVFrames";
      else
        parentType = "Elements";

      if (childrensType.toLowerCase() == parentType.toLowerCase()) {
        const elementId = document.main.configGraph.addElementFromDict(elementConf, parentId, parentType);

        const element = document.main.configGraph.getElementById(elementId);
        const type = element.parentType;

        if (element.parentType == "Operations" || element.parentType == "CVFrames") {
          const node = $(selectors.processList).find("#operations[data-id='" + parentId + "']")
        } else {
          const node = element.parentConfig['node'];
        }

        document.main.configGraph.fillListElements(type, node, parentId);
      } else {
        notificate('Неверный тип элемента');
      }

    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  })
  $(document).on('click', selectors.btnDuplicate, function (e) {
    let parentType
    const parentId = $(this).parents('.list').attr('data-id');
    const elementId = $(this).parents(selectors.listItem).attr('data-id');
    const elementConf = document.main.configGraph.getConfigElement(elementId);

    if (elementConf.type == "Process")
      parentType = "Processes";
    else if (elementConf.type == "Operation")
      parentType = "Operations";
    else if (elementConf.type == "CVFrame")
      parentType = "CVFrames";
    else
      parentType = "Elements";

    const newElementId = document.main.configGraph.addElementFromDict(elementConf, parentId, parentType);
    const element = document.main.configGraph.getElementById(newElementId);
    const type = element.parentType;
    let node

    if (element.parentType == "Operations" || element.parentType == "CVFrames") {
      node = $(selectors.processList).find("#operations[data-id='" + parentId + "']")
    } else {
      node = element.parentConfig['node'];
    }

    document.main.configGraph.fillListElements(type, node, parentId);
  })
  $(document).on('click', selectors.btnAdd, function (e) {
    const listId = $($(this).parents('.list')[0]).attr('id');
    const parentId = $($(this).parents('.list')[0]).attr('data-id');

    let listConfig

    if ($(this).hasClass('cv')) {
      listConfig = listElements['CVOperations'];
      listConfig['parentType'] = 'CVOperations';
    } else if ($(this).hasClass('process')) {
      listConfig = listElements['Processes'];
    } else if ($($(this).parents('.list-item')[0]).hasClass('cv')) {
      listConfig = listElements['CVFrames'];
    } else {
      listConfig = Object.values(listElements).find(
        (el) => el.node == "#" + listId || el.node == '.modal.active #' + listId);
    }
    let modal

    if (!listConfig) {
      return
    } else if (listConfig['parentType'] == 'Elements') {
      const types = document.main.configGraph.getElementChildrensTypes(parentId);
      const modal = new SelectTypeModal(types, parentId);
      modal.render().show();
    } else {
      const element = document.main.configGraph.newElement(parentId, listConfig);
      const modal = new ElementModal(element);
      modal.render().addClass('edited').addClass('new-element').show();
    }
  })
  $(document).on('click', selectors.btnSave, function () {
    const modal = getCurrentModal();
    document.main.configGraph.setConfigValues(modal.element.id, modal.getValues());
    modal.removeClass('edited');
    modal.close();

    const elementId = $(this).parents('.params').attr('data-id');
    const element = document.main.configGraph.getElementById(elementId);
    let node

    if (element.parentType == "Operations" || element.parentType == "CVFrames") {
      node = $(selectors.processList).find("#operations[data-id='" + element.parentId + "']")
    } else {
      node = element.parentConfig['node']
    }

    document.main.configGraph.fillListElements(element.parentType, node, element.parentId, elementId)
  })
  $(document).on('click', ".tab#save-project", function () {
    const modal = getCurrentModal();
    document.main.configGraph.setConfigValues(modal.element.id, modal.getValues());

    document.main.events("fileLocationSave")();
  })
  $(document).on('click', '.btn-type-select', function () {
    const checked = $(this).parents('.params').find('input[name=type]:checked');
    let selectedType, modal;

    if (checked.length) {
      selectedType = checked.val();
      let modal = getCurrentModal();
      modal.close();

      modal = getCurrentModal();

      const elementValues = Object.fromEntries(
        Object.entries(
          document.main.elementParams[[selectedType]])
          .filter(([k, v]) => v.type)
          .map(([k, v]) => [k, v.default_value == undefined ? '' : v.default_value])
      )

      elementValues['type'] = selectedType;

      let parentConfig = {
        node: '.modal.active #elements',
        parentType: 'Elements',
        rowkeys: ['type'],
        type: selectedType
      }

      const element = document.main.configGraph.newElement(modal.element.id, parentConfig, elementValues);
      modal = new ElementModal(element);
      modal.render().addClass('edited').addClass('new-element').show();
    } else {
      alert('Не выбран тип элемента.')
    }
  })
  $(document).on('click', selectors.btnCloseModal, function () {
    document.modal = getCurrentModal();
    const modal = document.modal
    modal.close();

    if (modal.element) {
      const element = document.main.configGraph.getElementById(modal.element.id);
      if (!element) return

      const fillNode = element.parentConfig['node'] + "[data-id=" + modal.element.id + "]";
      document.main.configGraph.fillListElements(element.parentType, fillNode, element.parentId, modal.element.id)
    }
  });
  $(document).on('click', selectors.listItem, function (e) {
    e.stopPropagation();

    if ($(this).attr("data-type") != "process") {
      $(this).parent(selectors.list).find(selectors.listItem).removeClass("active");
    }

    $(this).toggleClass("active");

    if ($(e.target).is(".list .item-name")) {
      const elementId = $(this).attr("data-id");
      const element = document.main.configGraph.getElementById(elementId);
      const type = element.parentType;

      if (element.type != "Process") {
        const elementConf = document.main.configGraph.getConfigElement(elementId);
        sendDataToUpdatePreview(elementConf)
      }

      if (type == "Elements") {
        document.main.configGraph.fillListElements(type, ".modal.active .list-param.active .element-childs-wrap", elementId, false, false);
      }
    }
  })
  $(document).on('click', '#processes > .list-item > .item-nav', function (e) {
    const processNode = $(this).parent(".list-item");

    if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
      const elementId = processNode.attr('data-id');
      const childsNode = processNode.find(".item-childs");

      if (processNode.hasClass('cv'))
        document.main.configGraph.fillListElements("CVFrames", childsNode, elementId);
      else
        document.main.configGraph.fillListElements("Operations", childsNode, elementId);

      childsNode.stop().slideToggle();
    }
  })
  $(document).on('click', '.main-conf-wrap .section-header', function (e) {
    hideMain();
  })
  $(document).on('click', '.querys > li', function (e) {
    if (e.target === this) {
      $("#sql-query").val($(this).text());
      $("#query-params").val($(this).attr("data-params"));
    } else if ($(e.target).is("i.fa-times")) {
      let querys = document.main.settings.sqlQuerys;
      const queryText = $(this).text();
      const queryParams = $(this).attr("data-params");

      querys.splice(querys.findIndex((v) => v.query == queryText && v.params == queryParams), 1);
      $(this).remove();

      if ($('.querys > li').length == 0) {
        $('.querys').remove();
      }
    }
  })
  $(document).on('change', 'select.element-type', function () {

  })
  $(document).on('change', '.modal.active :input', function () {

  })
  $(document).on('change', '.form :input', function () {
    const paramName = $(this).attr("data-param-name");

    if (paramName) {
      $(this).attr('data-id', 1);
      const value = $(this).prop('type') == 'checkbox' ? $(this).prop('checked') : $(this).val()
      document.main.configGraph.setConfigValues(1, { [paramName]: value });
    }
  })
  $(document).on('change', '.textarea-param', function () {
    const paramName = $(this).attr("data-param-name");

    if (paramName) {
      const value = $(this).val()
      document.main.configGraph.setConfigValues(1, { [paramName]: value });
    }
  })
  $(window).keydown(function (e) {
    let key = e.keyCode;

    if (e.ctrlKey)
      key = "ctrl+" + key;
    if (e.shiftKey)
      key = "shift+" + key;
    if (e.altKey)
      key = "alt+" + key;

    // console.log(e.keyCode);
    // console.log(key);

    if (keys[key]) {
      e.preventDefault();
      document.main.events(keys[key])();
      return false;
    };
  });
  $(document).on('change', '#vendor-login, #vendor-password', function () {
    let login = $('#vendor-login').val()
    let password = $('#vendor-password').val()
    let authString = 'Basic ' + btoa(encodeURIComponent(login + ':' + password));
    $('#vendor_auth').val(authString)

    let paramName = $('#vendor_auth').attr("data-param-name");
    let paramValue = authString;
    let params = {};
    params[paramName] = paramValue;

    // document.main.saveElement(params, "ConfigurationSettings", ''); TODO: потерялся метод?
  });
  $(document).on('change', '#handlers-login, #handlers-password', function () {
    let login = $('#handlers-login').val();
    let password = $('#handlers-password').val();
    let authString = 'Basic ' + btoa(encodeURIComponent(login + ':' + password));
    $('#handler_auth').val(authString);

    let paramName = $('#handler_auth').attr("data-param-name");
    let paramValue = authString;
    let params = {};
    params[paramName] = paramValue;

    document.main.saveElement(params, "ConfigurationSettings", '');
  });
  window.onbeforeunload = function (e) {
    // return e TODO: модалка при обновлении страницы
  };
  $(document).on('click', '.toggle-mnu', function (e) {
    toggleMainMenu();
    e.stopPropagation();
  })
  $(document).on('click', '.btn-group.main button', function () {
    toggleMainMenu();
  })
  $(document).on('click', function (e) {
    if ($(".btn-group.main").hasClass('active') && !$(e.target).hasClass('toggle-mnu')) {
      toggleMainMenu();
    }
  })
  $(document).on('click', '.btn-group.main', function (e) {
    e.stopPropagation();
  });
  addTabListeners()
  addSideMenuListeners()
  document.querySelector('#open-py-handlers-file').addEventListener('click', pickHandlersFile)
});

const addTabListeners = () => {
  const tabList = [
    'common', 'process', 'main-menu', 'properties', 'schedulers', 'python-files', 
    'media-files', 'common-handlers'
  ]

  tabList.forEach((tabId) => {
    const dataTab = `[data-tab-id="main-conf-${tabId}"]`
    const tab = document.querySelector(dataTab)
    tab.addEventListener('click', () => selectTab(tab))
  })
}

const addSideMenuListeners = () => {
  document.querySelector('#new-project').addEventListener('click', pickNewFileProject)
  document.querySelector('#open-project').addEventListener('click', showPickFileModal)
  document.querySelector('#save-project').addEventListener('click', fileLocationSave)
  document.querySelector('#save-project-as').addEventListener('click', fileLocationSaveAs)
  document.querySelector('#export-data').addEventListener('click', exportConfigData)
  document.querySelector('#qr-settings').addEventListener('click', showQRSettings)
  document.querySelector('#preview-button').addEventListener('click', togglePrev)
  document.querySelector('#open-modal-sql-queries').addEventListener('click', showSqlQueries)
  document.querySelector('#open-modal-send-req').addEventListener('click', showSearchElements)
}

function toggleMainMenu() {
  $('.toggle-mnu').toggleClass("on");
  $('.btn-group.main').toggleClass("active");
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
    notificate('Скопировано в буфер', 'success')
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}
function editElement(elementId) {
  const element = document.main.configGraph.getElementById(elementId);

  const modal = new ElementModal(element);
  modal.render().show();
}
function loadedPrev(prevNode) {
  $(".preload").hide();
  $(prevNode).addClass("load");
}

function selectTab(tabNode) {
  $(".tabs .tab").removeClass("active");
  $(tabNode).addClass("active");

  var tabID = $(tabNode).attr("data-tab-id");

  $(".main-conf-wrap section").removeClass("active");
  $(".main-conf-wrap #" + tabID).addClass("active");

  if ($(tabNode).data('tab-id') === 'main-conf-process') {
    sendDataToUpdatePreview();
    $("#main-conf-screen").addClass('active');
    $("#main-conf-cvframes").addClass('active');
  } else {
    $("#main-conf-screen").removeClass('active');
    $("#main-conf-cvframes").removeClass('active');
  }
}
async function sendDataToUpdatePreview(dataToSend) {
  return// TODO проверить работу превью
  let data;
  if (dataToSend) {
    data = {
      "action": "screen_items",
      "data": dataToSend
    };
  } else {
    //берем заголовки только у не скрытых процессов
    const processesList = document.main.configGraph.elements
      .filter((el) => el.parentType == 'Processes' && el.elementValues['hidden'] == false)
      .map((item) => item.title);

    data = {
      "action": "processes_list",
      "data": processesList
    };
  }
  try {
    const response = await fetch('http://localhost:5000/ws_editor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Ответ сервера:", responseData);
  } catch (error) {
    console.error("Ошибка при обмене данными с сервером:", error);
  }
}

function hideMain() {
  if ($(".main-conf-wrap").hasClass("hide")) {
    $(".main-conf-wrap section .section-header").find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
  } else {
    $(".main-conf-wrap section .section-header").find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
  }

  $(".main-conf-wrap").toggleClass("hide");
}




async function sendRequest(node) {
  let mode = $('#req-mode').val();
  let params = $('#req-params').val();
  let body = ''
  try {
    body = JSON.stringify(document.main.settings.reqBodyEditor.get())
  }
  catch {
    console.debug(document.main.settings.reqBodyEditor)
  }

  let nodeText = $(node).text();

  if (!document.main.settings.deviceHost) {
    notificate('Device connection error');
    return
  }

  if (mode == 'SyncCommand') {
    var URI = `${document.main.settings.deviceHost}?mode=${mode}&listener=${params}`;
  }
  if (mode == 'BackgroundCommand') {
    var URI = `${document.main.settings.deviceHost}?mode=${mode}&command=${params}`;
  }

  const req_params = {
    // URI: URI,
    host: document.main.settings.deviceHost,
    mode: mode,
    method: params,
    body: body
  };

  $(node).html(`<img style="width: 70px;height: 13px;transform: scale(2.5);" src="/js/pre.svg">`)

  const result = await sendRequestToDevice(req_params);

  $(node).html(nodeText)

  if (result) {
    if (result.error) {
      notificate(result.content);
    } else {
      const modal = getCurrentModal();
      // modal.renderRequestResult(JSON.parse(result.data));
      modal.renderRequestResult(result.data);
    }
  }
}
async function auth(node) {
  let login = $('#login').val();
  let pass = $('#password').val();

  const data = {
    login: login,
    pass: pass,
  };

  const result = await authFunc(data);

  if (result) {
    if (result.error) {
      notificate(result.content);
    } else {
      /**/
    }
  }
}

function pickFileApply() {
  const modal = getCurrentModal();
  modal.close();
}

