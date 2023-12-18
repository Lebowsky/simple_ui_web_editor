$(document).ready(function(){
	sortableInit(selectors.list);
	main.settings.modalWidth = 820;

	filePath = localStorage.getItem('file-path');

	if (!filePath) {
		newFile();
	} else {
		readFile(filePath);
	}

	async function newFile () {
		conf = await getNewConfiguration()
		initReadedConf(conf)
	}

	async function readFile (filePath) {
		conf = await loadConfiguration(filePath);
		initReadedConf(conf, filePath);
	}

	$('#prev').resizable({
		minWidth: 250,
		handles: "e,w",
		start: function(event, ui) {
			$('iframe').css('pointer-events','none');
		},
		stop: function(event, ui) {
			$('iframe').css('pointer-events','auto');
		}
	});
	$(document).on('keyup', "#search", function(e){
		const q = $(this).val();
		let elements = [];
		let listItems = [];
		const node = $("#search-result-wrap");
		
		if (q != "") {
			elements = main.configGraph.elements.filter(element =>
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
				let path = main.configGraph.getElementPath(item.id);
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
	$(document).on('click', selectors.btnEdit, function(){
		const elementId = $(this).parents(selectors.listItem).attr('data-id');
		editElement(elementId);
	})
	$(document).on('dblclick', selectors.listItem, function(e){
		if (e.target === this) {
			const elementId = $(this).attr('data-id');
			editElement(elementId);
		}
	})
	$(document).on('click', '.path .element-path:not(:last-child)', function(e){
		const elementId = $(this).attr('data-id');
		editElement(elementId);
	})
	$(document).on('change', "#ip-address", function(){
		main.settings.deviceHost = $(this).val();
	})
	$(document).on('click', selectors.btnDelete, function(){
		if (confirm('Вы уверены?')) {
			const elementId = $(this).parents(selectors.listItem).attr('data-id');
			const element = main.configGraph.getElementById(elementId);
			const type = element.parentType;
			const node = element.parentConfig['node'];
			const parentId = element.parentId;

			main.configGraph.removeElement(element);
			main.configGraph.fillListElements(type, node, parentId);

			if (type == "Processes") {
				main.configGraph.fillListElements("Operations", selectors.operationsList, 1);
			}
		}
	})
	$(document).on('click', selectors.btnCopy, function(e){
		const elementId = $(this).parents(selectors.listItem).attr('data-id');
		elementConf = main.configGraph.getConfigElement(elementId);
		copyTextToClipboard(JSON.stringify(elementConf));
	})
	$(document).on('click', selectors.btnJson, function(e){
		const elementId = $(this).parents(selectors.listItem).attr('data-id');
		elementConf = main.configGraph.getConfigElement(elementId);
		
		modal = new JsonModal(elementConf);
		modal.render();
		modal.show();
	})
	$(document).on('dblclick', ".sql-table tr", function(e){
		modal = ModalWindow.getCurrentModal();
		table = modal.modal.find('.sql-table').DataTable();
		rowData = table.row(this).data();
	    data = {};

	    table.columns().every(function (index) {
	        var columnName = table.column(Number(index)).header().textContent;
	        data[columnName] = rowData[index];
	    });

		modal = new JsonModal(data);
		modal.render();
		modal.show();
	} );
	$(document).on('click', ".show-sql-table-json", function(e){
		modal = ModalWindow.getCurrentModal();
		table = modal.modal.find('.sql-table').DataTable();
		data = table.rows().data();
		jsonData = [];

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
	$(document).on('click', selectors.btnPaste, function(e){
		const parentId = $(this).parents('.list').attr('data-id');
		const childrensType = $(this).attr('data-childrens-type');

        navigator.clipboard.readText().then(function(text) {
		    try {
		    	text = text.replace(/:[ ]*False/g,':false').replace(/:[ ]*True/g,':true');
        		elementConf = JSON.parse(text);
		    } catch (error) {
        		notificate('Элемент не найден в буфере');
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
    			elementId = main.configGraph.addElementFromDict(elementConf, parentId, parentType);

				const element = main.configGraph.getElementById(elementId);
				const type = element.parentType;
				const node = element.parentConfig['node'];
				main.configGraph.fillListElements(type, node, parentId);
    		} else {
        		notificate('Неверный тип элемента');
    		}

        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
	})
	$(document).on('click', selectors.btnDuplicate, function(e){
		const parentId = $(this).parents('.list').attr('data-id');
		const elementId = $(this).parents(selectors.listItem).attr('data-id');
		const elementConf = main.configGraph.getConfigElement(elementId);

		if (elementConf.type == "Process")
	    	parentType = "Processes";
	    else if (elementConf.type == "Operation")
	    	parentType = "Operations";
	    else if (elementConf.type == "CVFrame")
	    	parentType = "CVFrames";
	    else
	    	parentType = "Elements";

    	const newElementId = main.configGraph.addElementFromDict(elementConf, parentId, parentType);
		const element = main.configGraph.getElementById(newElementId);
		const type = element.parentType;
		const node = element.parentConfig['node'];

		main.configGraph.fillListElements(type, node, parentId);
	})
	$(document).on('click', selectors.btnAdd, function(e){
		const listId = $(this).parents('.list').attr('id');
		const parentId = $(this).parents('.list').attr('data-id');

		if ($(this).hasClass('cv')) {
			listConfig = listElements['CVOperations'];
			listConfig['parentType'] = 'CVOperations';
		} else if ($(this).hasClass('process')) {
			listConfig = listElements['Processes'];
		} else {
			listConfig = Object.values(listElements).find(
				(el) => el.node=="#" + listId || el.node=='.modal.active #' + listId);
		}

		if (!listConfig){
			return
		}else if (listConfig['parentType'] == 'Elements'){
			const types = main.configGraph.getElementChildrensTypes(parentId);
			modal = new SelectTypeModal(types, parentId);
			modal.render().show();
		}else{
			element = main.configGraph.newElement(parentId, listConfig);
			modal = new ElementModal(element);
			modal.render().addClass('edited').addClass('new-element').show();
		}
	})
	$(document).on('click', selectors.btnSave, function(){
		modal = ModalWindow.getCurrentModal();
		main.configGraph.setConfigValues(modal.element.id, modal.getValues());
		modal.removeClass('edited');
		modal.close();

		elementId = $(this).parents('.params').attr('data-id');
		element = main.configGraph.getElementById(elementId);
		main.configGraph.fillListElements(element.parentType, element.parentConfig['node'], element.parentId, elementId)

		if (element.parentType == "Processes") {
			main.configGraph.fillListElements("Operations", selectors.operationsList, element.id);
		}
	})
	$(document).on('click', '.btn-type-select', function(){
		const checked = $(this).parents('.params').find('input[name=type]:checked');
		let selectedType, modal;

		if (checked.length){
			selectedType = checked.val();
			modal = ModalWindow.getCurrentModal();
			modal.close();

			modal = ModalWindow.getCurrentModal();

			const elementValues = Object.fromEntries(
				Object.entries(
					main.elementParams[[selectedType]])
					.filter(([k, v]) => v.type)
					.map(([k, v]) => [k, v.default_value==undefined ? '': v.default_value])
				)

			elementValues['type'] = selectedType;
			
			let parentConfig = {
				node: '.modal.active #elements',
				parentType: 'Elements',
				rowkeys: ['type'],
				type: selectedType
			}

			element = main.configGraph.newElement(modal.element.id, parentConfig, elementValues);
			modal = new ElementModal(element);
			modal.render().addClass('edited').addClass('new-element').show();
		}else{
			alert('Не выбран тип элемента.')
		}
	})
	$(document).on('click', selectors.btnCloseModal, function(){
		modal = ModalWindow.getCurrentModal();
		modal.close();

		if (modal.element) {
			element = main.configGraph.getElementById(modal.element.id);
			fillNode = element.parentConfig['node']+"[data-id="+modal.element.id+"]";
			main.configGraph.fillListElements(element.parentType, fillNode, element.parentId, modal.element.id)

			if (element.parentType == "Processes") {
				main.configGraph.fillListElements("Operations", selectors.operationsList, element.id);
			}
		}
	});
	$(document).on('click', selectors.listItem, function(e){
		$(this).parents(selectors.list).find(selectors.listItem).removeClass("active");
		$(this).addClass("active");

		if ($(e.target).is(".list .item-name")) {
			const elementId = $(this).attr("data-id");
			const element = main.configGraph.getElementById(elementId);
			const type = element.parentType;

			if (type == "Elements") {
				/*const childsNode = ModalWindow.getCurrentModal().modal.find(".element-childs");
				if (childsNode.length) {
					childsNode.remove();
				} else {*/
					main.configGraph.fillListElements(type, ".modal.active .list-param.active .element-childs-wrap", elementId, false, false);
				//}
			}
		}/* else if (ModalWindow.getCurrentModal()) {
			const childsNode = ModalWindow.getCurrentModal().modal.find(".element-childs");
			if (childsNode.length) {
				childsNode.remove();
			} 
		}*/
	})
	$(document).on('click', '#processes .list-item', function(e){
		if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
			const elementId = $(this).attr('data-id');

			if ($(this).hasClass('cv')) {
				main.configGraph.fillListElements("CVFrames", selectors.CVFramesList, elementId);
				$("#main-conf-cvframes").addClass('active');
				if ($("#main-conf-screen").hasClass('active')) {
					$("#main-conf-screen").removeClass('active');
				}
				showList($("#main-conf-cvframes .section-header"), "down");
			} else {
				main.configGraph.fillListElements("Operations", selectors.operationsList, elementId);
				$("#main-conf-screen").addClass('active');
				if ($("#main-conf-cvframes").hasClass('active')) {
					$("#main-conf-cvframes").removeClass('active');
				}
				showList($("#main-conf-screen .section-header"), "down");
			}
		}
	})
	$(document).on('click', '.main-conf-wrap .section-header', function(e){
		hideMain();
	})
	$(document).on('click', '.querys > li', function(e){
		if (e.target === this) {
			$("#sql-query").val($(this).text());
			$("#query-params").val($(this).attr("data-params"));
		} else if ($(e.target).is("i.fa-times")) {
			let querys = main.settings.sqlQuerys;
			const queryText = $(this).text();
			const queryParams = $(this).attr("data-params");

			querys.splice(querys.findIndex((v) => v.query == queryText && v.params == queryParams), 1);
			$(this).remove();

			if ($('.querys > li').length == 0) {
				$('.querys').remove();
			}
		}
	})
	$(document).on('change', 'select.element-type', function(){
		// let modal = $(this).parents(selectors.modal),
		// 	type  = $(this).val(),
		// 	parentType = modal.attr('data-parent-type'),
		// 	path  = modal.attr("data-path");

		// params = main.getElementParamsByForm(modal);
		// //main.saveElement(params, type, path);
		// main.renderModalParams(modal, type, path, parentType);
		// modal.addClass("edited");
	})
	$(document).on('change', '.modal.active :input', function(){
		// let modal = $(this).parents(selectors.modal);
		// modal.addClass("edited");
	})
	$(document).on('change', '.form :input', function(){
		const paramName = $(this).attr("data-param-name");
		
		if (paramName){
			$(this).attr('data-id', 1);
			const value = $(this).prop('type') == 'checkbox'? $(this).prop('checked'): $(this).val()
			main.configGraph.setConfigValues(1, {[paramName]: value});
		}
	})
	$(window).keydown(function(e) {
		let key = e.keyCode;
		const currentModal = ModalWindow.getCurrentModal()
		hotkeys = currentModal ? currentModal.getHotkeys() : {}	
		const events = Object.assign(main.events(), hotkeys)

		if (e.ctrlKey)
			key = "ctrl+"+key;
		if (e.shiftKey)
			key = "shift+"+key;
		if (e.altKey)
			key = "alt+"+key;

		console.log(key);

		if (events[key]) {
			e.preventDefault();
			events[key]();
			return false;
		};
	});
	$(document).on('change', '#vendor-login, #vendor-password', function(){
		let login = $('#vendor-login').val()
		let password = $('#vendor-password').val()
		let authString = 'Basic ' + btoa(encodeURIComponent(login + ':' + password));
		$('#vendor_auth').val(authString)

		let paramName = $('#vendor_auth').attr("data-param-name");
		let paramValue = authString;
		let params = {};
		params[paramName] = paramValue;

		main.saveElement(params, "ConfigurationSettings", '');
	});
	$(document).on('change', '#handlers-login, #handlers-password', function(){
		let login = $('#handlers-login').val();
		let password = $('#handlers-password').val();
		let authString = 'Basic ' + btoa(encodeURIComponent(login + ':' + password));
		$('#handler_auth').val(authString);

		let paramName = $('#handler_auth').attr("data-param-name");
		let paramValue = authString;
		let params = {};
		params[paramName] = paramValue;

		main.saveElement(params, "ConfigurationSettings", '');
	});
    window.onbeforeunload = function (e) {
        return e
    };
	$(document).on('click', '.toggle-mnu', function(e){
		toggleMainMenu();
	    e.stopPropagation();
	})
	$(document).on('click', '.btn-group.main button', function(){
		toggleMainMenu();
	})
	$(document).on('click', function(e){
		if ($(".btn-group.main").hasClass('active') && !$(e.target).hasClass('toggle-mnu')) {
			toggleMainMenu();
		}
	})
	$(document).on('click', '.btn-group.main', function(e) {
	    e.stopPropagation();
	});
});
function toggleMainMenu () {
	$('.toggle-mnu').toggleClass("on");
	$('.btn-group.main').toggleClass("active");
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    	notificate('Скопировано в буфер', 'success') 
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}
function editElement(elementId) {
	const element = main.configGraph.getElementById(elementId);

	modal = new ElementModal(element);
	modal.render().show();
}
function loadedPrev(prevNode) {
	$(".preload").hide();
	$(prevNode).addClass("load");
}
function togglePrev() {
	$(".prev-wrap").toggleClass("show");
}
function selectTab(tabNode) {
	$(".tabs .tab").removeClass("active");
	$(tabNode).addClass("active");

	tabID = $(tabNode).attr("data-tab-id");

	$(".main-conf-wrap section").removeClass("active");
	$(".main-conf-wrap #" + tabID).addClass("active");
	console.debug($(this).data());
	//if ($(tabNode).data('tab-id') != 'main-conf-process') {
		$("#main-conf-screen").removeClass('active');
		$("#main-conf-cvframes").removeClass('active');
	/*} else {
	}*/
}
function selectModalTab(tabNode) {
	// $(".tabs .tab").removeClass("active");
	$(tabNode).siblings().removeClass("active");
	$(tabNode).addClass("active");

	tabID = $(tabNode).attr("data-tab");
	modal = ModalWindow.getCurrentModal().modal;

	modal.find(".params").find(".param").removeClass("active");
	const $currentTab = modal.find(".params").find(".param[data-tab=" + tabID + "]")
	$currentTab.addClass("active");
	
	if (['elements', 'handlers'].includes(tabID)){
		const label = $currentTab.find('label');
		showList(label, 'down');
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
function renderEditor(node, data = ''){
    const editor = new JSONEditor(node, {
        mode: 'code'
    });

    editor.set(data);

    return editor;
}
function showList(node, direction = "toggle") {
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
function sortableInit(node) {
    $(node).sortable({
    	items: "> li",
    	containment: "parent",
    	cursor: "grabbing",
    	handle: ".move",
		update: function(event, ui) {
			console.log(ui.item.prev().attr("data-id"))
			let element1Id = ui.item.attr("data-id");
			
			if (ui.originalPosition.top < ui.position.top)
				element2Id = ui.item.prev().attr("data-id");
			else
				element2Id = ui.item.next().attr("data-id");

			main.configGraph.moveElement(element1Id, element2Id);
		}
	});
}
async function sendSQLQuery(node){
	let query = $('#sql-query').val();
	let params = $('#query-params').val();
	let nodeText = $(node).text();

	if (!main.settings.deviceHost){
		notificate('Device connection error');
		return
	}

	const query_params = {
		device_host: main.settings.deviceHost || '',
		db_name: $('#db-name').val(),
		query: query,
		params: params
	};
	
	$(node).html(`<img style="width: 70px;height: 13px;transform: scale(2.5);" src="/js/pre.svg">`)

	const result = await sendSqlQueryToDevice(query_params);
	
	$(node).html(nodeText)

	if (result){
		if (result.error){
			notificate(result.content);
		} else {
			if (!main.settings.sqlQuerys.find((el) => el.query == query && el.params == params))
				main.settings.sqlQuerys.push({query:query, params:params});

			$(".querys-wrap").html(SQLQueryModal.renderSqlQueryHistory(main.settings.sqlQuerys));

			modal = ModalWindow.getCurrentModal();
			modal.renderSqlQueryResult(result.data);
		}
	}
}
async function sendRequest(node){
	let mode = $('#req-mode').val();
	let params = $('#req-params').val();
	let body = ''
	try {
		body = JSON.stringify(main.settings.reqBodyEditor.get())
	}
	catch {
		console.debug(main.settings.reqBodyEditor)
	}
	
	let nodeText = $(node).text();

	if (!main.settings.deviceHost){
		notificate('Device connection error');
		return
	}

	if (mode == 'SyncCommand') {
		var URI = `${main.settings.deviceHost}?mode=${mode}&listener=${params}`;
	}
	if (mode == 'BackgroundCommand') {
		var URI = `${main.settings.deviceHost}?mode=${mode}&command=${params}`;
	}

	const req_params = {
		// URI: URI,
		host: main.settings.deviceHost,
		mode: mode,
		method: params,
		body: body
	};
	
	$(node).html(`<img style="width: 70px;height: 13px;transform: scale(2.5);" src="/js/pre.svg">`)

	const result = await sendRequestToDevice(req_params);
	
	$(node).html(nodeText)

	if (result){
		if (result.error){
			notificate(result.content);
		} else {
			modal = ModalWindow.getCurrentModal();
			// modal.renderRequestResult(JSON.parse(result.data));
			modal.renderRequestResult(result.data);
		}
	}
}
async function auth(node){
	let login = $('#login').val();
	let pass = $('#password').val();

	const data = {
		login: login,
		pass: pass,
	};

	const result = await authFunc(data);

	if (result){
		if (result.error){
			notificate(result.content);
		} else {
			/**/
		}
	}
}