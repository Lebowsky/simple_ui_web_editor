class ListElement {
    constructor(items, elementType) {
        this.items = items;
        this.html;
        this.elementType = elementType;
    }
    render() {
        this.html = `
            <div class="btn-group">
                <button class="btn-add">Add</button>
                ${main.clipboard.length && this.elementType && main.clipboard[0].parentType.toLowerCase() == this.elementType.toLowerCase() ? `<button class="btn-paste">Paste</button>` : ``}
            </div>
        `
        this.html += `${this.renderRows()}`
        return this;
    }
    renderRows() {
        let html = '';
        if (!this.items || this.items.length == 0)
            return "No Items"

        this.items.forEach((item, index) => {
            html += `
                <li class="list-item ${item.itemClasses ? item.itemClasses : ''}" data-id=${item.id}>
                    <span class="item-name">${item.name}</span>
                    ${item.value ?`<div class="item-info"><span title="${item.value}">${item.value}</span></div>`: ''}
                    <div class="item-btn">
                        <span class="copy" title="copy"><i class="fa fa-clipboard" aria-hidden="true"></i></span>
                        <span class="duplicate" title="duplicate"><i class="fa fa-copy" aria-hidden="true"></i></span>
                        <span class="edit" title="edit"><i class="fa fa-edit" aria-hidden="true"></i></span>
                        <span class="delete" title="delete"><i class="fa fa-trash" aria-hidden="true"></i></span>
                        <span class="move"><i class="fa fa-bars" aria-hidden="true"></i></span>
                    </div>
                </li>
            `
        });
        return html;
    }
    renderElementChild() {
        let html = '<ul class="element-childs">';
        if (!this.items || this.items.length == 0)
            return "";

        this.items.forEach((item, index) => {
            html += `
            <li class="">
                <span class="item-name">${item.name}</span>
                ${item.value ?`<span class="item-value">${item.value}</span>`: ''}
            </li>
        `
        });
        html += '</ul>';

        return html;
    }
    addProcessesButton($node){
        $node.find('.btn-group').append($('<button class="btn-add-from-file">Add from file</button>'))
        return this
    }
}
class ModalWindow {
    constructor(){
        this.html = '';
        this.modal = $('');
    }
    addClass(className) {
        this.modal.addClass(className);
        return this;
    }
    removeClass(className) {
        this.modal.removeClass(className);
        return this;
    }
    show() {
        $("#modals-wrap").addClass("active");
        $(selectors.modal).removeClass("active");
        this.modal.appendTo('#modals-wrap').addClass("active")
        $('.content').addClass("blur");
        $("body").addClass("no-scroll");

        sortableInit(selectors.list);
    }
    static getCurrentModal() {
        const modalDiv = $('#modals-wrap.active').find('.modal.active');
        if (modalDiv.length == 0)
            return

        let modalWindow;
        const elementId = modalDiv.find('.params').attr('data-id');

        if (modalDiv.hasClass('type-select-modal')) {
            const types = main.configGraph.getElementChildrensTypes(elementId)
            modalWindow = new SelectTypeModal(types);
        } else if (modalDiv.hasClass('qr')) { 
            modalWindow = new ImageModal();
        } else if (modalDiv.hasClass('sql-query')){
            modalWindow = new SQLQueryModal();
            modalWindow.modal = modalDiv;
        } else {
            const element = main.configGraph.getElementById(elementId);
            modalWindow = new ElementModal(element);
        }
        modalWindow.modal = modalDiv;
        return modalWindow;
    }
}
class ElementModal extends ModalWindow{
    constructor(element) {
        super();
        this.element = element;
        this.title = element.title;
        this.tabs = element.elementConfig.tabs;
        this.params = element.elementConfig;
        this.values = element.elementValues;
        this.path = main.configGraph.getElementPath(element.id);
    }
    render(){
        this.html = `
            <div class='modal'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>${this.title}<span class='edited'>*</span></h2>
                    <span class='path'>${this.path}</span>
                </div>
                <div class='modal-content'></div>
            </div>
            `
        this.modal = $(this.html)
        this.modal.find(selectors.modalContent).html(this.renderParams())
        return this;
    }
    renderParams() {
        const html = `
            <div class="params" data-id="${this.element.id}">
            ${this.renderTabs()}
            ${this.renderItems()}
            ${this.renderButtons()}
            </div>
            `
        return html;
    }
    renderTabs() {
        let html = ''
        const arrTabs = Object.entries(this.tabs).map((el) => {
            return {[el[0]]: el[1]}}).sort((a, b) => {
                return (Object.values(a)[0].ordering) -(Object.values(b)[0].ordering)
            })

        if (arrTabs && (arrTabs).length > 1) {
            html = `<div class='tabs'>`;
            arrTabs.forEach((el) => {
                let [name, value] = Object.entries(el)[0]
                html += `<div onclick="selectModalTab(this)" class="tab" data-tab="${name}">${value.title}</div>`
            })
            html += '</div>'
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
        })
        return html;
    }
    renderElementFields(name, type, fields) {
        let html = '';

        if (['elements', 'handlers'].includes(type)) {
            const elementsList = main.configGraph.elements.filter(
                (el) => el.parentId == this.element.id && el.parentType == name);
    
            html += `
                <div class="param active list-param" data-tab="${fields["tab_name"]}">
                    <label onclick="showList(this)">${name} ${elementsList.length ? `(${elementsList.length})`: ''}
                        <i class="fa fa-angle-down" aria-hidden="true"></i>
                    </label>
                    <div class="list-wrap" style="display: none;">
                        <ul class="list ${type}" id="${type}" data-id="${this.element.id}">${this.renderListElement(elementsList, type)}</ul>
                        <div class="element-childs-wrap"></div>
                    </div>
                </div>
            `
        } else {
            const renderParams = {
                ...fields,
                name: name,
                value: this.values[name],
            };

            html += `
                <div class="param active" data-tab="${fields["tab_name"]}">
                ${this.renderModalElement(renderParams)}
                </div>
            `
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
            }
            const value = Object.keys(item.elementValues).find((el) => ['Value', 'method'].includes(el))
            if (value){
                itemValues['value'] = item.elementValues[[value]]
            }
            listItems.push(itemValues)
        })
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
        const { type, name, text } = params;

        const renderElements = {
            text: `
                <label for="${name}">${text}</label>
                <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" value="${value}">
                `,

            checkbox: `
                <div>
                    <label for="${name}">${text}</label>
                    <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" ${value}>
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
        }

        return renderElements[type]
    }
    getParamsValue(params) {
        return {
            text: params.value ? params.value : '',
            type: params.value ? params.value : '',
            select: params.value ? params.value : '',
            checkbox: params.value == true ? 'checked' : ''
        }[params.type]
    }
    getSelectOptions(params) {
        const { options, value } = params;
        if (options)
            return `${options.map(option => `<option value="${option}" ${option == value ? 'selected' : ''}>${option}</option>`).join('')}`
    }
    close() {
        let resultConfirm = !this.modal.hasClass('edited') || (this.modal.hasClass('edited') && confirm('Закрыть без сохранения?'));

        if (!resultConfirm)
            return

        if (this.modal.siblings(selectors.modal).length) {
            const prevModal = this.modal.prev();
            prevModal.addClass("active");

            const dataTab = prevModal.find('.param.active').attr('data-tab');
            if (dataTab)
                prevModal.find(`.tab[data-tab=${dataTab}]`).addClass('active')

        } else {
            this.modal.parents("#modals-wrap").removeClass("active");
            $("body").removeClass("no-scroll");
            $('.content').removeClass("blur");
        }

        if (this.modal.hasClass('edited') && this.modal.hasClass('new-element')) {
            main.configGraph.removeElement(this.element);
        }

        this.modal.remove();
    }
    getValues() {
        const values = {};
        let inputNode, selectNode;

        this.modal.find('.params').children('.param').each((index, paramNode) => {
            inputNode = $(paramNode).find('input');
            if (inputNode.length) {
                const paramName = inputNode.attr('data-param-name')
                const value = inputNode.prop('type') == 'checkbox' ? inputNode.is(':checked') : inputNode.val();
                if (value)
                    values[paramName] = value
            }

            selectNode = $(paramNode).find('select');
            if (selectNode.length){
                const paramName = selectNode.attr('data-param-name');
                values[paramName] = $(selectNode.find('option:selected')).val();
            } 
        });
        return values;
    }
    show(){
        super.show();
        const tabs = $(this.modal).find('.tab');
        if (tabs.length > 1)
            selectModalTab(tabs[0])
    }
}
class SelectTypeModal extends ModalWindow {
    constructor(types, parentId) {
        super();
        this.types = types;
        this.parentId = parentId;
        this.modal = $('');
        this.html = '';
        this.selectedValue;
    }
    render() {
        this.html = `
            <div class='modal type-select-modal'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Select type</h2>
                </div>
                <div class='modal-content'>
                    <div class="params" data-id="${this.parentId}">
                    ${this.types.map(type => {return `
                        <div class="param active">
                            <input type="radio" name="type" id="${type}" value="${type}">    
                            <label for="${type}">${type}</label>
                        </div>`}).join('')}
                        <div class="btn-group modal-btn">
                            <button class="btn-type-select">Select</button>
                        </div>
                    </div>
                </div>
            </div>
            `
        this.modal = $(this.html)
        return this;
    }
    close() {
        if (this.modal.siblings(selectors.modal).length) {
            const prevModal = this.modal.prev();
            prevModal.addClass("active");
        } else {
            this.modal.parents("#modals-wrap").removeClass("active");
            $("body").removeClass("no-scroll");
            $('.content').removeClass("blur");
        }

        this.modal.remove();
    }
    setSelectedValue(value){
        this.selectedValue = value;
    }
}
class ImageModal extends ModalWindow{
    constructor() {
        super();
        this.modal = $('');
        this.html = '';
    }
    render(){
        this.html = `
            <div class='modal qr'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>QR Settings<span class='edited'>*</span></h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `
        this.modal = $(this.html)
        
        return this;
    }
    
    close() {
        if (this.modal.siblings(selectors.modal).length) {
            const prevModal = this.modal.prev();
            prevModal.addClass("active");
        } else {
            this.modal.parents("#modals-wrap").removeClass("active");
            $("body").removeClass("no-scroll");
            $('.content').removeClass("blur");
        }
        this.modal.remove();
    }
}
class SQLQueryModal extends ModalWindow{
    constructor(ipAddress) {
        super();
        this.modal = $('');
        this.html = '';
        this.ipAddress = ipAddress;
        this.dbName = 'SimpleKeep';
        this.params = '';
        this.query = 'SELECT * from RS_docs';
    }
    render(){
        this.html = `
            <div class='modal sql-query'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>SQL Queries<span class='edited'>*</span></h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `
        this.modal = $(this.html)
        this.modal.find(selectors.modalContent).html(this.renderContent())
        return this;
    } 
    renderContent(){
        const html = `
        <div>
            <div id="sql-query-content">
                <div id="query-params-wrap">
                    <div class="param">
                        <label for="ip-address">IP Address</label>
                        <input type="text" name="ip-address" value="${this.ipAddress}" id="ip-address">
                    </div>
                    <div class="param">
                        <label for="db-name">DB Name</label>
                        <input type="text" name="db-name" value="${this.dbName}" id="db-name">
                    </div>
                    <div class="param">
                        <label for="query-params">Params</label>
                        <input type="text" name="query-params" value="${this.params}" id="query-params">
                    </div>
                </div>
                <div class="param">
                    <textarea name="query" cols="80" rows="8" id="sql-query">${this.query}</textarea>
                    <div class="btn-wrap">
                        <button onclick="sendSQLQuery(this)">select</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="querys-wrap">${SQLQueryModal.renderSqlQueryHistory(main.sqlQuerys)}</div>
        <div id="sql-table-wrap"> </div>
        `
        return html;    
    }  
    static renderSqlQueryHistory(querys){
        let html = "";

        if (querys.length) {
            html += `
            <div class="section-header" onclick="showList(this)">Query history<i class="fa fa-angle-down" aria-hidden="true"></i></div>
            <ul class="list-wrap querys">
                ${querys.map((el) => `<li data-params="${el.params}">${el.query}</li>`).join('\n')}
            </ul>
            `
        }
        return html;
    }
    renderSqlQueryResult(data){
        let html = ``;
        
        if (data) {
            html = `
            <table class="sql-table display nowrap dataTable no-footer dtr-inline collapsed">
                <thead>
                    ${data.header.split('|').map((el) => `<th>${el}</th>`).join('\n')}
                </thead>
                <tbody>
                ${data.data.map((el) => `<tr>${el.split('|').map((el)=>`<td>${el}</td>`).join('\n')}</tr>`).join('\n')}
                </tbody>
            </table>
            `
        } else if (data == null) {
            html = `Нет записей`
        }
        this.modal.find('#sql-table-wrap').html(html)
        this.modal.find('.sql-table').DataTable({
            responsive: true,
            language: {
                "lengthMenu": "_MENU_",
                "url": "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json"
            }
        });
    }
    close(){
        if (this.modal.siblings(selectors.modal).length) {
            const prevModal = this.modal.prev();
            prevModal.addClass("active");
        } else {
            this.modal.parents("#modals-wrap").removeClass("active");
            $("body").removeClass("no-scroll");
            $('.content').removeClass("blur");
        }
        this.modal.remove();    
    }
}