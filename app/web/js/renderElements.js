class ListElement {
    constructor(items, elementType) {
        this.items = items;
        this.html = "";
        this.elementType = elementType;
    }
    render(addBtn = true) {

        if (addBtn) {
            this.html += `
                <div class="btn-group">
                    <button class="btn-add">Add</button>
                    ${`<button class="btn-paste" data-childrens-type="${this.elementType}">Paste</button>`}
                </div>
            `
        }

        this.html += `${this.renderRows()}`
        return this;
    }
    renderRows() {
        let html = '';
        if (!this.items || this.items.length == 0)
            return "No Items"

        this.items.forEach((item, index) => {
            html += `
                <li class="list-item ${item.itemClasses ? item.itemClasses : ''}" title="${item.path ? item.path : ''}" data-id=${item.id}>
                    <span class="item-name">${item.name}</span>
                    ${item.value ?`<div class="item-info"><span title="${item.value}">${item.value}</span></div>`: ''}
                    <div class="item-btn">
                        <span class="json" title="json"><i class="fa-solid fa-code"></i></span>
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
        main.current_modal = this
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
        main.current_modal = null   
    }
    static getCurrentModal() {
        const modalDiv = $('#modals-wrap.active').find('.modal.active');
        if (modalDiv.length == 0)
            return

        let modalWindow;
        const elementId = modalDiv.find('.params').attr('data-id');
        
        if (main.current_modal) {
            modalWindow = main.current_modal
        }else if (modalDiv.hasClass('type-select-modal')) {
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
        } else if (modalDiv.hasClass('json')){
            modalWindow = new JsonModal();
            modalWindow.modal = modalDiv;
        } else if (modalDiv.hasClass('search')){
            modalWindow = new SearchElementsModal();
            modalWindow.modal = modalDiv;
        } else {
            const element = main.configGraph.getElementById(elementId);
            modalWindow = new ElementModal(element);
        }
        main.current_modal=modalWindow
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
            } else if (modalDiv.hasClass('json')){
                modalWindow = new JsonModal();
                modalWindow.modal = modalDiv;
            } else if (modalDiv.hasClass('search')){
                modalWindow = new SearchElementsModal();
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
    getHotkeys(){
        return {}
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
        const { type, name, text, description, onclick=`pickFile('python')` } = params;

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
                    <button id="open-py" onclick="${onclick}">Open</button>
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
        main.current_modal = null
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
            <span class="show-sql-table-json"><i class="fa-solid fa-code"></i></span>
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
            pageLength: localStorage.getItem('lengthTable') ? localStorage.getItem('lengthTable') : 10,
            language: {
                "lengthMenu": "_MENU_",
                "url": "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json"
            }
        });
        this.modal.find('.sql-table').on('length.dt', function (e, settings, len){
            localStorage.setItem('lengthTable', len);
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
    constructor({uiPath='', dirPath='', configPath=''}='') {
        super();
        this.modal = $('');
        this.html = '';
        this.uiPath = uiPath;
        this.configPath = configPath;
        this.dirPath = dirPath;
    }
    render(){
        this.html = `
            <div class='modal pick-file' data-modal-type='start'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Pick File</h2>
                    <button id='apply-open-conf-file'>Apply</button>
                </div>
                <div class='modal-content'></div>
            </div>
            `
        this.modal = $(this.html);
        this.modal.find(selectors.modalContent).html(this.renderContent());
        this.addHandlers()

        return this;
    } 
    renderContent(){
        const html = `
        <div class="list-wrap show">
            <ul class="list">
                <li>
                    <label>UI Config</label>
                    <span id="ui-config-path" data-param-name="uiConfigDir">${this.uiPath ? this.uiPath : '&lt;Not selected&gt;'}</span>
                    <button id="open-ui-config">Open dir</button>
                </li>
                <li>
                    <label>Working dir</label>
                    <span id="working-dir-path" data-param-name="workingDir">${this.dirPath ? this.dirPath : '&lt;Not selected&gt;'}</span>
                    <button id="open-working-dir">Open dir</button>
                </li>
                <li>
                    <label>Project config file</label>
                    <span id="project-config-path" data-param-name="projectConfig">${this.configPath ? this.configPath : '&lt;Not selected&gt;'}</span>
                    <button id="open-project-config">Open file</button>
                </li>
            </ul>
        </div>
        `
        return html;    
    }
    addHandlers(){
        this.modal.find("#apply-open-conf-file").click(this.btnApplyHandler);
        this.modal.find("#open-ui-config").click(this.btnPickUiConfigHandler);
        this.modal.find("#open-working-dir").click(this.btnPickWorkingDirHandler);
        this.modal.find("#open-project-config").click(this.btnPickProjectConfigHandler);
    }
    getHotkeys(){
        return {
            '27': () => {}, //Esc
            'ctrl+79': this.btnPickUiConfigHandler, // Ctrl+O
            'ctrl+13': this.btnApplyHandler // Ctrl+Enter
        }
    }
    async btnApplyHandler(){
        const uiPath = $("#ui-config-path").val();
        const workdir = $("#working-dir-path").val();
        const projectConfig = $("#project-config-path").val();

        result = checkAskFileResult(await checkConfigFile(uiPath));
        if (result) {
            conf = await loadConfiguration(uiPath, workdir, projectConfig);
            initReadedConf(conf, uiPath);
            localStorage.setItem('file-path', uiPath);
            ModalWindow.getCurrentModal().close();
        }
        main.settings.uiPath = uiPath;
        main.settings.dirPath = workdir;
        main.settings.configPath = projectConfig;
    }
    async btnPickUiConfigHandler(){
        let result = await askFile('simple_ui');
        if (checkAskFileResult(result)) {
            const emptyText = "<Not selected>";
            const filePath = result.file_path;
            const workdir = $("#working-dir-path").val() || result.workdir;
            const projectConfig = $("#project-config-path").val() || result.project_config;

            $("#ui-config-path").text(filePath);
            $("#ui-config-path").val(filePath);
            $("#working-dir-path").text(workdir ? workdir : emptyText);
            $("#working-dir-path").val(workdir);
            $("#project-config-path").text(projectConfig ? projectConfig : emptyText);
            $("#project-config-path").val(projectConfig);
        };
    }
    async btnPickWorkingDirHandler(){
        const resultAsk = await askDir();
        if (resultAsk && resultAsk.path) {
            $('#working-dir-path').text(resultAsk.path);
            $("#working-dir-path").val(resultAsk.path);
        };
    }
    async btnPickProjectConfigHandler(){
        let result = await askFile('project_config');
        if (checkAskFileResult(result)) {
            $("#project-config-path").text(result.file_path);
            $("#project-config-path").val(result.file_path);
        };
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
        const data = {};
        
        main.settings.reqBodyEditor = renderEditor(this.modal.find("#req-body")[0], '');

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
                    <div class="btn-wrap">
                        <button onclick="sendRequest(this)">send</button>
                    </div>
                </div>
                <div class="param active">
                    <label onclick="showList(this)" for="req-body">Body <i class="fa fa-angle-up" aria-hidden="true"></i></label>
                    <div id="req-body" class="list-wrap"></div>
                </div>
            </div>
        </div>
        <div id="req-result-wrap"></div>
        `
        return html;
    }
    renderRequestResult(data){
        this.modal.find("#req-result-wrap").html("");
        renderEditor(this.modal.find("#req-result-wrap")[0], data);
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
class JsonModal extends ModalWindow{
    constructor(json) {
        super();
        this.modal = $('');
        this.html = '';
        this.json = json;
    }
    render(){
        this.html = `
            <div class='modal json' data-modal-type='json'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Json</h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `
        this.modal = $(this.html)
        this.modal.find(selectors.modalContent).html(this.renderContent())
        renderEditor(this.modal.find("#json-editor")[0], this.json);

        return this;
    } 
    renderContent(){
        const html = `<div id="json-editor"></div>`

        return html;    
    }
}
class SearchElementsModal extends ModalWindow{
    constructor(json) {
        super();
        this.modal = $('');
        this.html = '';
    }
    render(){
        this.html = `
            <div class='modal search' data-modal-type='element'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Search Elements</h2>
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
            <div id="search-content">
                <div id="search-params-wrap">
                    <div class="param active">
                        <label for="ip-address">Search</label>
                        <input type="text" name="search" value="" id="search" placeholder="Enter search text here...">
                    </div>
                </div>
            </div>
        </div>
        <div id="search-result-wrap" class="list ui-sortable"></div>
        `
        return html;    
    }
    show(){
        super.show()
        this.modal.find('#search').focus()
    }
}