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
                ${`<button class="btn-paste" data-childrens-type="${this.elementType}">Paste</button>`}
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
            <li class="list-item" data-id="${item.id}">
                <span class="item-name">${item.name}</span>
                ${item.value ?`<span class="item-value">${item.value}</span>`: ''}
            </li>
        `
        });
        html += '</ul>';

        return html;
    }
    addProcessesButton($node){
        $node.find('.btn-group').append($('<button class="btn-add cv">Add CVOperation</button>'));
        $node.find('.btn-group .btn-add').addClass('process');
        return this;
    }
}
class ModalWindow {
    constructor(){
        this.html = '';
        this.modal = $('');
        this.modalWidth = 820;
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
        const modalType = this.modal.data("modal-type");
        const modalWidth = localStorage.getItem("modal-"+modalType+"-width") ? localStorage.getItem("modal-"+modalType+"-width") : this.modalWidth;
        this.modal.css('width', modalWidth);
        this.modal.resizable({
            minWidth: 700,
            handles: "e",
            stop: function(event, ui) {
                if (modalType != undefined) {
                    const lsItem = "modal-"+modalType+"-width";
                    localStorage.setItem(lsItem, ui.size.width);
                }

                main.settings.modalWidth = ui.size.width;
            }
        });

        sortableInit(selectors.list);
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
        } else if (modalDiv.hasClass('auth')){
            modalWindow = new AuthModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('pick-file')){
            modalWindow = new PickFileModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('start')){
            modalWindow = new StartModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('send-req')){
            modalWindow = new SendReqModal();
            modalWindow.modal = modalDiv;
        } else {
            const element = main.configGraph.getElementById(elementId);
            modalWindow = new ElementModal(element);
        }
        modalWindow.modal = modalDiv;
        return modalWindow;
    }
    static getModals(modalSelector) {
        const modalsDiv = $('#modals-wrap.active').find(`.modal${modalSelector}`);
        if (modalsDiv.length == 0)
            return

        let modalWindow = '';
        let modalsWindow = [];

        for (var i = modalsDiv.length - 1; i >= 0; i--) {
            let modalDiv = $(modalsDiv[i]);
            let elementId = modalDiv.find('.params').attr('data-id');

            if (modalDiv.hasClass('type-select-modal')) {
                let types = main.configGraph.getElementChildrensTypes(elementId)
                modalWindow = new SelectTypeModal(types);
            } else if (modalDiv.hasClass('qr')) { 
                modalWindow = new ImageModal();
            } else if (modalDiv.hasClass('sql-query')){
                modalWindow = new SQLQueryModal();
                modalWindow.modal = modalDiv;
            } else if (modalDiv.hasClass('auth')){
                modalWindow = new AuthModal();
                modalWindow.modal = modalDiv;
            } else if (modalDiv.hasClass('pick-file')){
                modalWindow = new PickFileModal();
                modalWindow.modal = modalDiv;
            } else if (modalDiv.hasClass('start')){
                modalWindow = new StartModal();
                modalWindow.modal = modalDiv;
            } else {
                let element = main.configGraph.getElementById(elementId);
                modalWindow = new ElementModal(element);
            }
            modalWindow.modal = modalDiv;
            modalsWindow.push(modalWindow);
        }

        return modalsWindow;
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
            `
        this.modal = $(this.html)
        this.modal.find(selectors.modalContent).html(this.renderParams())

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
            html += `<div class='tab' id='save-project' onclick='fileLocationSave()'>Save Project</div>`
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
                    <label onclick="showList(this)">${name} ${elementsList.length ? `(<span class='count'>${elementsList.length}</span>)`: ''}
                        <i class="fa fa-angle-down" aria-hidden="true"></i>
                    </label>
                    <div class="list-wrap" style="display: none;">
                        <ul class="list ${type}" id="${type}" data-id="${this.element.id}">${this.renderListElement(elementsList, type)}</ul>
                        <div class="element-childs-wrap"></div>
                    </div>
                </div>
            `
        } else {
            if (fields.hidden)
                return ''
            
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
                    <button id="open-py" onclick="pickFile('python')">Open</button>
                </div>
                `,
        }

        return renderElements[type]
    }
    getParamsValue(params) {
        return {
            text: params.value ? params.value : '',
            type: params.value ? params.value : '',
            file: params.value ? params.value : '',
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
                //if (value)
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
            <div class='modal type-select-modal' data-modal-type='element'>
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
            <div class='modal qr' data-modal-type='qr'>
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
            <div class='modal sql-query' data-modal-type='sql-query'>
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
        <div class="querys-wrap">${SQLQueryModal.renderSqlQueryHistory(main.settings.sqlQuerys)}</div>
        <div id="sql-table-wrap"> </div>
        `
        return html;    
    }  
    static renderSqlQueryHistory(querys){
        let html = "";

        if (querys && querys.length) {
            html += `
            <div class="section-header" onclick="showList(this)">Query history<i class="fa fa-angle-down" aria-hidden="true"></i></div>
            <ul class="list-wrap querys">
                ${querys.map((el, index) => `<li data-params="${el.params}">${el.query}<i class="fa fa-times" aria-hidden="true"></i></li>`).join('\n')}
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
}
class AuthModal extends ModalWindow{
    constructor() {
        super();
        this.modal = $('');
        this.html = '';
    }
    render(){
        this.html = `
            <div class='modal auth' data-modal-type='auth'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Authorization</h2>
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
        <div class='auth-params'>
            <div class="param">
                <label for="login">Login</label>
                <input type="text" name="login" value="" id="login">
            </div>
            <div class="param">
                <label for="password">Password</label>
                <input type="password" name="password" value="" id="password">
            </div>
        </div>
        <div class="btn-wrap">
            <button onclick="auth(this)">Login</button>
        </div>
        `
        return html;    
    }
}
class PickFileModal extends ModalWindow{
    constructor(filePath, dirPath, projectConfigPath) {
        super();
        this.modal = $('');
        this.html = '';
        this.filePath = filePath;
        this.dirPath = dirPath;
        this.projectConfigPath = projectConfigPath;
    }
    render(){
        this.html = `
            <div class='modal pick-file' data-modal-type='start'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Pick File</h2>
                    <button id="apply-pick-files" onclick="applyPickFiles()">Apply</button>
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
        <div class="list-wrap show">
            <ul class="list">
                <li>
                    <label>Simple UI file</label>
                    <span id="ui-file-path" data-param-name="uiFilePath">${this.filePath ? this.filePath : '&lt;Not selected&gt;'}</span>
                    <button id="open-ui-file" onclick="pickFile('simple_ui')">Open file</button>
                </li>
                <li>
                    <label>Working dir</label>
                    <span id="working-dir-path" data-param-name="workingDir">${this.dirPath ? this.dirPath : '&lt;Not selected&gt;'}</span>
                    <button id="open-working-dir" onclick="pickWorkingDir()">Open dir</button>
                </li>
                <li>
                    <label>Project config file</label>
                    <span id="project-config-path" data-param-name="projectConfigPath">${this.projectConfigPath ? this.projectConfigPath : '&lt;Not selected&gt;'}</span>
                    <button id="open-project-config" onclick="pickFile('project_config')">Open file</button>
                </li>
            </ul>
        </div>
        `
        return html;    
    }
}
class SendReqModal extends ModalWindow{
    constructor(ipAddress) {
        super();
        this.modal = $('');
        this.html = '';
        this.ipAddress = ipAddress;
    }
    render(){
        this.html = `
            <div class='modal send-req' data-modal-type='send-req'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Send Request<span class='edited'>*</span></h2>
                </div>
                <div class='modal-content'> </div>
            </div>
            `
        this.modal = $(this.html)
        this.modal.find(selectors.modalContent).html(this.renderContent())

        // const data = {"parentType":"Operations","type":"Operation","Name":"SeriesSelectScreen","Timer":false,"hideToolBarScreen":false,"hideBottomBarScreen":true,"noScroll":false,"handleKeyUp":false,"noConfirmation":true,"Elements":[{"type":"LinearLayout","Variable":"","orientation":"vertical","height":"wrap_content","width":"match_parent","weight":"0","Elements":[{"Value":"@doc_data","Variable":"","height":"wrap_content","width":"match_parent","weight":"0","TextBold":false,"TextItalic":false,"TextSize":"16","type":"TextView"},{"type":"LinearLayout","Variable":"","orientation":"vertical","height":"wrap_content","width":"match_parent","weight":"0","Elements":[{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"match_parent","width":"match_parent","weight":"0","Elements":[{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"wrap_content","width":"match_parent","weight":"1","Elements":[{"Value":"Артикул:","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":true,"TextColor":"#000000","type":"TextView"},{"Value":"@good_art","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":false,"TextItalic":false,"TextColor":"#000000","type":"TextView"}]}]},{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"wrap_content","width":"wrap_content","weight":"0","Elements":[{"Value":"Характеристика:","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":true,"TextColor":"#000000","type":"TextView"},{"Value":"@properties_name","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":false,"TextItalic":false,"TextColor":"#000000","type":"TextView"}]},{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"wrap_content","width":"wrap_content","weight":"0","Elements":[{"Value":"Цена:","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":true,"TextColor":"#cc0000","type":"TextView"},{"Value":"@price","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":false,"TextItalic":false,"TextColor":"#cc0000","type":"TextView"}]},{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"wrap_content","width":"wrap_content","weight":"0","Elements":[{"Value":"Упаковка:","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":true,"TextColor":"#000000","type":"TextView"},{"Value":"@good_unit","Variable":"","height":"wrap_content","width":"wrap_content","weight":"0","TextBold":false,"TextItalic":false,"TextColor":"#000000","type":"TextView"}]}]},{"Value":"@good_name","Variable":"","height":"wrap_content","width":"match_parent","weight":"0","TextBold":true,"TextItalic":false,"TextSize":"24","TextColor":"#7A005C","type":"TextView"},{"type":"LinearLayout","Variable":"","orientation":"horizontal","height":"wrap_content","width":"match_parent","weight":"0","Elements":[{"type":"LinearLayout","Variable":"","orientation":"vertical","height":"wrap_content","width":"match_parent","weight":"1","Elements":[{"Value":"План","Variable":"","height":"wrap_content","width":"match_parent","weight":"0","type":"TextView"},{"Value":"@qtty_plan","Variable":"qtty_plan","height":"wrap_content","width":"match_parent","weight":"0","TextBold":false,"TextItalic":false,"TextSize":"24","type":"TextView"}]},{"type":"LinearLayout","Variable":"","orientation":"vertical","height":"wrap_content","width":"match_parent","weight":"1","Elements":[{"Value":"Факт","Variable":"","height":"wrap_content","width":"match_parent","weight":"0","TextBold":false,"TextItalic":false,"type":"TextView"},{"Value":"@qtty","Variable":"qtty","height":"wrap_content","width":"match_parent","weight":"0","TextBold":false,"TextItalic":false,"TextSize":"24","type":"TextView"}]}]},{"Value":"@series_cards","Variable":"series_cards","height":"wrap_content","width":"match_parent","weight":"0","TextBold":false,"TextItalic":false,"type":"CardsLayout"}]},{"type":"barcode","Value":"","Variable":"barcode"}],"Handlers":[{"event":"onStart","listener":"","action":"run","type":"python","method":"series_list_on_start","postExecute":""},{"event":"onInput","listener":"","action":"run","type":"python","method":"series_list_on_input","postExecute":""}]};
        const data = {};
        
        main.settings.reqBodyEditor = this.renderEditor(this.modal.find("#req-body")[0], data);

        return this;
    }
    renderContent(){
        const html = `
        <div>
            <div id="send-req-content">
                <div id="req-params-wrap">
                    <div class="param active">
                        <label for="ip-address">IP Address</label>
                        <input type="text" name="ip-address" value="${this.ipAddress}" id="ip-address">
                    </div>
                    <div class="param active">
                        <label for="req-mode">Mode</label>
                        <select name="req-mode" id="req-mode">
                            <option value="SyncCommand" selcted>Sync Command</option>
                            <option value="BackgroundCommand">Background Command</option>
                        </select>
                    </div>
                    <div class="param active">
                        <label for="req-params">Param Value</label>
                        <input type="text" name="req-params" value="" id="req-params">
                    </div>
                </div>
                <div class="param active">
                    <label onclick="showList(this)" for="req-body">Body <i class="fa fa-angle-up" aria-hidden="true"></i></label>
                    <div id="req-body" class="list-wrap"></div>
                    <div class="btn-wrap">
                        <button onclick="sendRequest(this)">send</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="req-result-wrap"></div>
        `
        return html;
    }
    renderRequestResult(data){
        this.modal.find("#req-result-wrap").html("");
        this.renderEditor(this.modal.find("#req-result-wrap")[0], data);
    }
    renderEditor(node, data = ''){
        const editor = new JSONEditor(node, {
            mode: 'code'
        });

        editor.set(data);

        return editor;
    }
}
class StartModal extends ModalWindow{
    constructor() {
        super();
        this.modal = $('');
        this.html = '';
    }
    render(){
        this.html = `
            <div class='modal start' data-modal-type='start'>
                <div class='modal-head'>
                    <h2 class='modal-title'>Start</h2>
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
            <button id="new-project" onclick="pickNewFileProject(main)">New Project</button>
            <button id="open-project" onclick="showPickFile()">Open Project</button>
        `
        return html;    
    }
}