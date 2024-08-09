import { selectors } from "../../conf";
import { askFile } from "../../export";
import { ListElement } from './ListElement';
import { ModalWindow } from './ModalWindow';
import { checkAskFileResult } from "../../utils";
import { getCurrentModal } from "./modalsRoot";

export class ElementModal extends ModalWindow {
  constructor(element) {
    super();
    this.element = element;
    this.title = element.title;
    this.tabs = element.elementConfig.tabs;
    this.params = element.elementConfig;
    this.values = element.elementValues;
    this.path = document.main.configGraph.getElementPath(element.id);
  }
  render() {
    this.html = `
            <div class='modal' data-modal-type='element'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <div class='top'>
                        <h2 class='modal-title'>${this.title}<span class='edited'>*</span></h2>
                        ${this.renderTabs()}
                    </div>
                    <span class='path'>${this.path}</span>
                </div>
                <div class='modal-content'></div>
            </div>
            `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderParams());

    this.modal.resizable({
      minWidth: 450,
      handles: "e",
    });

    return this;
  }
  renderParams() {
    const html = `
            <div class="params" data-id="${this.element.id}">
            ${this.renderItems()}
            ${this.renderButtons()}
            </div>
            `;
    return html;
  }
  renderTabs() {
    let html = '';
    const arrTabs = Object.entries(this.tabs).map((el) => {
      return { [el[0]]: el[1] };
    }).sort((a, b) => {
      return (Object.values(a)[0].ordering) - (Object.values(b)[0].ordering);
    });

    if (arrTabs && (arrTabs).length > 1) {
      html = `<div class='tabs'>`;
      arrTabs.forEach((el, idx) => {
        let [name, value] = Object.entries(el)[0];
        html += `<div class="tab" data-tab="${name}">${value.title}</div>`;
      });
      html += `<div class='tab' id='save-project'>Save Project</div>`;
      html += '</div>';
    }
    return html;
  }
  renderItems() {
    let html = '';

    $.each(this.params, (name, fields) => {
      if (fields['type'] && fields["type"] != "operations") {
        html += this.renderElementFields(name, fields["type"], fields);
      } else if (name == 'type') {
        // html += this.renderElementFields(name, 'text', {type: 'type', text: 'type'});
      };
    });
    return html;
  }
  renderElementFields(name, type, fields) {
    let html = '';

    if (['elements', 'handlers'].includes(type)) {
      const elementsList = document.main.configGraph.elements.filter(
        (el) => el.parentId == this.element.id && el.parentType == name);

      html += `
                <div class="param active list-param" data-tab="${fields["tab_name"]}">
                    <label onclick="showList(this)">${name} ${elementsList.length ? `(<span class='count'>${elementsList.length}</span>)` : ''}
                        <i class="fa fa-angle-down" aria-hidden="true"></i>
                    </label>
                    <div class="list-wrap" style="display: none;">
                        <ul class="list ${type}" id="${type}" data-id="${this.element.id}">${this.renderListElement(elementsList, type)}</ul>
                        <div class="element-childs-wrap"></div>
                    </div>
                </div>
            `;
    } else {
      if (fields.hidden)
        return '';

      const renderParams = {
        ...fields,
        name: name,
        value: this.values[name],
      };

      html += `
                <div class="param active" data-tab="${fields["tab_name"]}">
                ${this.renderModalElement(renderParams)}
                </div>
            `;
    }
    return html;
  }
  renderListElement(elementsList, type) {

    const listItems = [];

    elementsList.forEach((item) => {
      const name = item.elementValues[item.parentConfig.rowKeys.filter(key => item.elementValues[key])[0]];
      const itemValues = {
        name: name,
        id: item.id
      };
      const value = Object.keys(item.elementValues).find((el) => ['Value', 'method'].includes(el));
      if (value) {
        itemValues['value'] = item.elementValues[[value]];
      }
      listItems.push(itemValues);
    });
    const listElement = new ListElement(listItems, type);
    return listElement.render().html;
  }
  renderButtons() {
    const html = `
        <div class="btn-group modal-btn">
            <button class="save-element">Save</button>
        </div>`;
    return html;
  }
  renderModalElement(params) {
    const value = this.getParamsValue(params);
    const { type, name, text, description } = params;

    const renderElements = {
      text: `
        <label for="${name}">${text}</label>
        <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" value="${value}" title="${description}">
      `,

      checkbox: `
        <div>
            <label for="${name}">${text}</label>
            <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" ${value} title="${description}">
        </div>
      `,

      select: `
        <label>${text}</label>
        <select data-param-name="${name}">
        ${this.getSelectOptions(params)}
        </select>
      `,

      elements: `
        <label onclick="showList(this)">${text}
            <i class="fa fa-angle-down" aria-hidden="true"></i>
        </label>
        <div class="list-wrap" style="display: none;">
            <ul class="list elements">No elements</ul>
        </div>
      `,

      handlers: `
        <label onclick="showList(this)">${text}
            <i class="fa fa-angle-down" aria-hidden="true"></i>
        </label>
        <div class="list-wrap" style="display: none;">
            <ul class="list handlers">No handlers</ul>
        </div>
      `,

      type: `
        <label for="${name}">${text}</label>
        <input type="text" name="${name}" id="${name}" data-param-name="${name}" value="${value}" readonly>
      `,

      file: `
        <label for="${name}">${text}</label>
        <div class="input-wrap">
            <input type="text" name="${name}" id="${name}" data-param-name="${name}" value="${value}">
            <button id="open-py">Open</button>
        </div>
      `,
    };

    return renderElements[type];
  }
  getParamsValue(params) {
    return {
      text: params.value ? params.value : '',
      type: params.value ? params.value : '',
      file: params.value ? params.value : '',
      select: params.value ? params.value : '',
      checkbox: params.value == true ? 'checked' : ''
    }[params.type];
  }
  getSelectOptions(params) {
    const { options, value } = params;
    if (options)
      return `${options.map(option => `<option value="${option}" ${option == value ? 'selected' : ''}>${option}</option>`).join('')}`;
  }
  close() {
    let resultConfirm = !this.modal.hasClass('edited') || (this.modal.hasClass('edited') && confirm('Закрыть без сохранения?'));

    if (!resultConfirm)
      return;

    if (this.modal.siblings(selectors.modal).length) {
      const prevModal = this.modal.prev();
      prevModal.addClass("active");

      const dataTab = prevModal.find('.param.active').attr('data-tab');
      if (dataTab)
        prevModal.find(`.tab[data-tab=${dataTab}]`).addClass('active');

    } else {
      this.modal.parents("#modals-wrap").removeClass("active");
      $("body").removeClass("no-scroll");
      $('.content').removeClass("blur");
    }

    if (this.modal.hasClass('edited') && this.modal.hasClass('new-element')) {
      document.main.configGraph.removeElement(this.element);
    }

    this.modal.remove();
  }
  getValues() {
    const values = {};
    let inputNode, selectNode;

    this.modal.find('.params').children('.param').each((index, paramNode) => {
      inputNode = $(paramNode).find('input');
      if (inputNode.length) {
        const paramName = inputNode.attr('data-param-name');
        const value = inputNode.prop('type') == 'checkbox' ? inputNode.is(':checked') : inputNode.val();
        //if (value)
        values[paramName] = value;
      }

      selectNode = $(paramNode).find('select');
      if (selectNode.length) {
        const paramName = selectNode.attr('data-param-name');
        values[paramName] = $(selectNode.find('option:selected')).val();
      }
    });
    return values;
  }
  show() {
    super.show();
    const tabs = $(this.modal).find('.tab');
    if (tabs.length > 1)
      ElementModal.selectModalTab(tabs[0]);


    document.querySelectorAll('.tabs .tab').forEach(item => {
      item.addEventListener('click', () => ElementModal.selectModalTab(item));
    });
    document.querySelector('#open-py')?.addEventListener('click', ElementModal.pickFile);
    document.querySelector('#open-py')?.addEventListener('click', ElementModal.pickFile);

  }
  static selectModalTab(tabNode) {
    // $(".tabs .tab").removeClass("active");
    $(tabNode).siblings().removeClass("active");
    $(tabNode).addClass("active");
  
    const tabID = $(tabNode).attr("data-tab");
    const modal = getCurrentModal()?.modal;
  
    if (!modal) return
  
    modal.find(".params").find(".param").removeClass("active");
    const $currentTab = modal.find(".params").find(".param[data-tab=" + tabID + "]")
    $currentTab.addClass("active");
  
    if (['elements', 'handlers'].includes(tabID)) {
      const label = $currentTab.find('label');
      ElementModal.showList(label, 'down');
    }
  }
  static showList(node, direction = "toggle") {
    if (direction == "up") {
      $(node).siblings(selectors.listWrap).slideUp();
      $(node).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
    } else if (direction == "down") {
      $(node).siblings(selectors.listWrap).slideDown();
      $(node).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
    } else {
      $(node).siblings(selectors.listWrap).slideToggle();
  
      if ($(node).find("i").hasClass("fa-angle-down")) {
        $(node).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
      } else if ($(node).find("i").hasClass("fa-angle-up")) {
        $(node).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
      }
    }
  }
  static async pickFile() {
    const modal = getCurrentModal();
    const modalType = modal?.element?.parentType;
    switch (modalType) {
      case 'PyFiles':
        ElementModal.pickFilePython();
        break;
      case 'Mediafile':
        ElementModal.pickFileMediadata();
        break;
      default:
        console.warn(`Unsupported pick file handler type: ${modalType}`);
    }

  }
  static async pickFilePython() {
    const result = await askFile('python');

    if (checkAskFileResult(result)) {
      const fileKey = result.file_name?.split('.')?.[0] || '';
      $("#file_path").val(result.file_path);
      $("#PyFileKey").val(fileKey);
    };
  }
  static async pickFileMediadata() {
    const result = await askFile('all');

    if (checkAskFileResult(result)) {
      const [fileKey, fileExt] = result.file_name?.split('.') || ['', ''];

      $("#file_path").val(result.file_path);
      $("#MediafileKey").val(fileKey);
      $("#MediafileExt").val(fileExt);
    };
  }
}
