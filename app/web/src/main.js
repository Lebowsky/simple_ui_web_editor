import { listElements, selectors, constants, newElements } from './conf'
import { ListElement } from './components/modals/ListElement';
import { PickFileModal } from './components/modals/PickFileModal';
import { sortableInit } from './handlers';
import { getConfParamValue, saveAllPyFilesToDisk } from './utils'
import { exportConfigData, fileLocationSave, fileLocationSaveAs, showPickFileModal, showQRSettings, showSearchElements, showSqlQueries, } from './dialogs'
import { togglePrev } from './handlers';
import { getCurrentModal, getModals } from './components/modals/modalsRoot';
import { ConfigManager } from './serviceLayer/configManager';
import { StorageService } from './adapters/storageService';

export const Main = {
  settings: {
    deviceHost: '',
    sqlQuerys: [],
    clipboard: [],
    modalWidth: [],
    filePath: '',
    configProjectPath: '',
    reqBodyEditor: {},
  },
  initUIConf(conf, filePath = '', configProjectPath = '') {
    this.conf = conf;
    
    const storage = new StorageService(conf)
    const configManager = new ConfigManager(storage)
    window.configManager = configManager
    this.configGraph = new ClientConfiguration(conf.ClientConfiguration, storage);

    this.clearMainSection();
    this.fillSelectElementsOptions();
    this.fillDefaultValues();
    this.fillConfigSettings();
    this.renderConfiguration();

    document.modal = getModals('.start');

    if (document.modal) {
      document.modal[0].close();
    }

    this.configGraph.fillConfigListElements();
    this.settings.filePath = filePath;
    this.settings.configProjectPath = configProjectPath

    $(".file-path").text(filePath);


    const pyHandlersPath = getConfParamValue('pyHandlersPath')
    this.conf.ClientConfiguration['pyHandlersPath']
    if (pyHandlersPath) {
      $('#py-handlers-file-path').text(pyHandlersPath)
    } else {
      $('#py-handlers-file-path').text(constants.pyHandlersEmptyPath)
    }
    $('#py-handlers-file-path').attr('data-path', pyHandlersPath)

    this.loadPrev();
    this.postInit();
  },
  postInit() {
    const btnPyfilesListButtons = document.getElementById('py-files')?.getElementsByClassName('btn-group')

    if (btnPyfilesListButtons) {
      const newButton = document.createElement('button');
      newButton.textContent = 'Save all';
      newButton.addEventListener('click', saveAllPyFilesToDisk);
      btnPyfilesListButtons[0].appendChild(newButton);
    }
  },
  clearMainSection() {
    $(selectors.processList).html("No processes");
    $(selectors.operationsList).html("No operations");
    $(selectors.commonHandlers).html("No handlers");
  },
  fillSelectElementsOptions() {
    $.each(document.main.elementParams.ClientConfiguration, function (key, value) {
      if (value.type == 'select') {
        const selectNode = $('#' + key)
        selectNode.empty()
        $.each(value.options, function (index, option) {
          selectNode.append($('<option>', {
            value: option,
            text: option
          }));
        })
      }
    });
  },
  fillDefaultValues() {
    $.each(document.main.elementParams.ClientConfiguration, function (key, val) {
      const el = $('#' + key)
      if (el.length && val.default_value != undefined)
        if (val.type == 'checkbox')
          el.prop('checked', val.default_value)
        else if (val.type == 'text')
          el.val(val.default_value)
    });
  },
  fillConfigSettings() {
    const settings = document.main.conf.ClientConfiguration?.ConfigurationSettings
    if (!settings) return

    const { vendor_auth: vendorAuth = '', handler_auth: handlerAuth = '' } = settings;

    let vendorLogin = '',
      vendorPassword = '',
      handlersLogin = '',
      handlersPassword = ''

    if (vendorAuth) {
      try {
        [vendorLogin = '', vendorPassword = ''] = decodeURIComponent(atob(vendorAuth.split(' ')[1])).split(':');
      } catch (error) {
        console.log(error);
      };
    };
    $('#vendor-login').val(vendorLogin);
    $('#vendor-password').val(vendorPassword);

    if (handlerAuth) {
      try {
        [handlersLogin = '', handlersPassword = ''] = decodeURIComponent(atob(handlerAuth.split(' ')[1])).split(':');
      } catch (error) {
        console.log(error);
      };
    };
    $('#handlers-login').val(handlersLogin);
    $('#handlers-password').val(handlersPassword);
  },
  renderConfiguration: function () {
    this.configGraph.fillConfigValues('ClientConfiguration');
  },
  loadPrev() {
    $("#prev .prev-content").html('<div class="preload">Load preview...</div><iframe onload="loadedPrev(this)" id="prev-if" src="http://localhost:5000/flet_preview"></iframe>');
  },
  events(event) {
    return {
      closeModal: () => {
        document.modal = getCurrentModal();
        const modal = document.modal
        if (modal)
          modal.close();
      },
      saveElementModal: () => {
        modal = getCurrentModal();
        if (!modal)
          return

        if (modal instanceof PickFileModal) {
          PickFileModal.pickFileApply()
          return
        }
        this.configGraph.setConfigValues(modal.element.id, modal.getValues());
        modal.removeClass('edited');
        modal.close();

        elementId = modal.element.id;
        element = main.configGraph.getElementById(elementId);
        main.configGraph.fillListElements(element.parentType, element.parentConfig['node'], element.parentId)
      },
      startNewProject: () => {
        pickNewFileProject(main)
      },
      openFile: () => {
        const currentModal = getCurrentModal()

        if (!currentModal) showPickFileModal()
        if (currentModal instanceof PickFileModal) PickFileModal.pickFile('simple_ui', '#ui-config-path')
      },
      fileLocationSave: () => {
        fileLocationSave();
      },
      fileLocationSaveAs: () => {
        fileLocationSaveAs()
      },
      exportConfigData: () => {
        exportConfigData()
      },
      showQrCode: () => {
        if (!!getCurrentModal()) return
        showQRSettings()
      },
      togglePreview: () => {
        togglePrev()
      },
      showSqlConsole: () => {
        if (!!getCurrentModal()) return
        showSqlQueries()
      },
      showSearchElements: () => {
        if (!!getCurrentModal()) return
        showSearchElements();
      },
    }[event];
  }
}

class ClientConfiguration {
  
  constructor(config, storage) {
    this.elements = [];
    this.lastId = 0;
    this.storage = storage
    this.addElementFromDict(config)
  }
  addElementFromDict(element, parentId = 0, parentType = 'ClientConfiguration') {
    const elementValues = {}
    // const elementId = this.getNewId()

    const contextType = this._getContextType(parentType)
    const newElementStorage = {
      parentId: parentId,
      contextType: contextType,
      content: elementValues
    }
    const elementId = this.storage.create(newElementStorage)

    $.each(element, (key, value) => {
      if (Array.isArray(value) && value.length)
        this.addElementsFromArray(value, elementId, key);
      else
        elementValues[key] = value
    });
    
    this.addElement(elementId, parentId, parentType, elementValues)
    return elementId;
  }
  addElementsFromArray(array, parentId, parentType) {
    array.forEach((value) => {
      this.addElementFromDict(value, parentId, parentType);
    })
  }
  addElement(id = '', parentId, parentType, elementValues) {
    let elementConfig;

    try {
      elementConfig = document.main.elementParams[elementValues.type] || document.main.elementParams[listElements[parentType]['type']]
    } catch (e) {
      console.debug('cant add element in graph:', parentType)
      console.debug(e)
    }

    const parentConfig = { ...listElements[parentType] };
    let title = parentConfig && parentConfig.rowKeys && parentConfig.rowKeys.length ? elementValues[parentConfig.rowKeys.filter(key => elementValues[key])[0]] : elementValues['type'];
    title = title || elementValues['type']

    if (parentConfig.type == 'Element') {
      parentConfig.type = elementValues['type'];
    }

    const newElement = {
      id: Number(id),
      parentId: Number(parentId),
      parentType: parentType == 'CVOperations' ? 'Processes' : parentType,
      title: title,
      parentConfig: parentConfig,
      elementConfig: elementConfig,
      elementValues: elementValues
    }
    
    this.elements.push(newElement);

    return newElement;
  }
  newElement(parentId, parentConfig, elementValues) {
    const parentType = parentConfig['parentType'];

    if (!elementValues)
      elementValues = { ...newElements[parentType] };

    return this.addElement(this.getNewId(), parentId, parentType, elementValues);
  }
  duplicateElement(element) {
    const newElement = this.addElement(this.getNewId(), element.parentId, element.parentType, structuredClone(element.elementValues));

    if (newElement.parentType == "Processes") {
      newElement.elementValues.Operations = [];
    }

    return newElement;
  }
  removeElement(element) {
    this.storage.delete(element.id, this._getContextType(element.parentType))
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }
  moveElement(element1Id, element2Id) {
    const element1 = this.getElementById(element1Id);
    const element2 = this.getElementById(element2Id);
    const index1 = this.elements.indexOf(element1);
    const index2 = this.elements.indexOf(element2);

    let el1 = this.elements.splice(index1, 1)[0];
    this.elements.splice(index2, 0, el1);
  }
  getNewId() {
    return ++this.lastId
  }
  getConfig() {
    let firstElement = structuredClone(this.elements.find((el) => el.parentId == 0));
    const clientConfig = {
      [firstElement.parentType]: { ...firstElement.elementValues }
    };

    let addElements = (configLevel, id) => {
      let elements = structuredClone(this.elements.filter((el) => el.parentId == id));
      elements.forEach((element) => {
        let index;
        let filledValues = Object.fromEntries(Object.entries(element.elementValues).filter(([k, v]) => v !== ''))

        if (configLevel[element.parentType]) {
          // index = configLevel[element.parentType].push({ ...element.elementValues }) - 1;
          index = configLevel[element.parentType].push(structuredClone(filledValues)) - 1;
        } else {
          configLevel[element.parentType] = [structuredClone(filledValues)];
          index = 0;
        }
        if (index != undefined)
          addElements(configLevel[element.parentType][index], element.id);
      })
    }
    addElements(clientConfig[firstElement.parentType], 1);
    return clientConfig
  }
  getConfigElement(elementId) {
    let firstElement = structuredClone(this.elements.find((el) => el.id == elementId));
    const clientConfig = {
      parentType: firstElement?.parentType,
      ...firstElement.elementValues
    };

    let addElements = (configLevel, id) => {
      let elements = structuredClone(this.elements.filter((el) => el.parentId == id));
      elements.forEach((element) => {
        let index;
        if (configLevel[element.parentType]) {
          index = configLevel[element.parentType].push({ ...element.elementValues }) - 1;
        } else {
          configLevel[element.parentType] = [{ ...element.elementValues }];
          index = 0;
        }
        if (index != undefined)
          addElements(configLevel[element.parentType][index], element.id);
      })
    }
    addElements(clientConfig, elementId);
    return clientConfig
  }
  getElementById(elementId) {
    return this.elements.find((el) => el.id == elementId)
  }
  getElementPath(elementId, path = []) {
    let element = this.getElementById(elementId);
    if (element.title) {
      path.unshift(`<a class='element-path' data-id='${element.id}'>${element.title}</a>`);
      this.getElementPath(element.parentId, path);
    }
    return path.join(' / ');
  }
  getElementChildrensTypes(elementId) {
    const element = this.getElementById(elementId);
    const elementType = element.parentConfig.type;
    const types = Object.entries(document.main.elementParams)
      .filter((el) => el[1]['type_'].find((el) => el['parent'] && el['parent'] == elementType))
      .map((el) => el[0])
    //test

    return types;
  }
  setConfigValues(elementId, values) {
    const element = this.getElementById(elementId);
    $.each(values, (name, value) => {
      element.elementValues[name] = value;
    })
  }
  fillConfigValues(type) {
    const element = this.elements.find((element) => element.parentType == type);
    this.fillElementValuesById(element, element.elementValues);
  }
  fillElementValuesById(element, values) {
    $.each(values, (key, value) => {
      if (typeof value == 'object') {
        this.fillElementValuesById(element, value);
      } else {
        const inputNode = $("#" + key);
        if (inputNode.length) {
          typeof value == 'boolean' ? inputNode.prop('checked', value) : inputNode.val(value);
          inputNode.attr('data-id', element.id)
        } else {
          console.debug(`Property ${key} not filled`);
        }
      }
    })
  }
  fillConfigListElements() {
    Object.entries(listElements).forEach((el) => {
      const [type, values] = el;
      if (values.node) {
        this.fillListElements(type, values.node);
      }
    })
  }
  fillListElements(type, node, parentId = 1, activeElementId = false, activeList = true) {
    let elements = this.elements.filter((element) => element.parentType == type && element.parentId == parentId);
    const listItems = [];
    const countNode = $(node).parents('.param').find('.count');

    if (type == "Processes" || type == "CVOperations") {
      elements = this.elements.filter((element) => (element.parentType == 'Processes' || element.parentType == 'CVOperations') && element.parentId == parentId);
    }

    elements.forEach((item) => {
      let name = item.elementValues[item.parentConfig.rowKeys.filter(key => item.elementValues[key])[0]];
      let value = Object.keys(item.elementValues).find((el) => ['Value', 'method'].includes(el));
      let itemClasses = "";
      name = name || item.elementValues['type'];

      if (value)
        value = item.elementValues[[value]]

      if (activeElementId == item.id)
        itemClasses = "active";

      if (item.elementValues.type == "CVOperation")
        itemClasses = "cv";

      listItems.push({
        name: name,
        value: value,
        id: item.id,
        itemClasses: itemClasses
      });
    })

    const listElement = new ListElement(listItems, type);

    if (activeList) {
      listElement.render();

      if (countNode.length > 0) {
        countNode.text(listItems.length);
      }

      $(node).siblings('.element-childs-wrap').html('');
    } else {
      $(node).html(listElement.renderElementChild());
      return
    }


    $(node).attr('data-id', parentId);
    $(node).html(listElement.html);
    if (type == 'Processes')
      listElement.addProcessesButton($(node));

    sortableInit(selectors.list);
  }
  _getContextType(value){
    return value.charAt(0).toLowerCase() + value.slice(1)
  }
}
