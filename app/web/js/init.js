$(document).ready(function(){
	sortableInit(selectors.list);

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
	$(document).on('click', selectors.btnEdit, function(){
		const elementId = $(this).parents(selectors.listItem).attr('data-id');
		const element = main.configGraph.getElementById(elementId);

		modal = new ElementModal(element);
		modal.render().show();
	})
	$(document).on('change', "#ip-address", function(){
		main.deviceHost = $(this).val();
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
		}
	})
	$(document).on('click', selectors.btnAdd, function(e){
		const listId = $(this).parents('.list').attr('id');
		const parentId = $(this).parents('.list').attr('data-id');
		const listConfig = Object.values(listElements).find(
			(el) => el.node=="#" + listId || el.node=='.modal.active #' + listId);

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
	});
	$(document).on('click', selectors.listItem, function(e){
		$(this).parents(selectors.list).find(selectors.listItem).removeClass("active");
		$(this).addClass("active");

		if (!$(e.target).is(".item-btn > *")) {
			const elementId = $(this).attr("data-id");
			const element = main.configGraph.getElementById(elementId);
			const type = element.parentType;

			if (type == "Elements") {
				main.configGraph.fillListElements(type, ".modal.active .list-param.active .element-childs-wrap", elementId, false, false);
				//main.configGraph.fillListElementChilds(elementId, ".modal.active .element-childs-wrap");
			}
		}
	})
	$(document).on('click', '#processes .list-item', function(e){
		if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
			const elementId = $(this).attr('data-id');
			main.configGraph.fillListElements("Operations", selectors.operationsList, elementId);
			showList($("#main-conf-screen .section-header"), "down");
		}
	})
	$(document).on('click', '.main-conf-wrap .section-header', function(e){
		hideMain();
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
			const value = $(this).prop('type') == 'checkbox'? $(this).prop('type'): $(this).val()
			main.configGraph.setConfigValues(1, {[paramName]: value});
		}
	})
	$(window).keyup(function(e) {
		key = e.keyCode;

		if (e.ctrlKey)
			key = "ctrl+"+key;
		if (e.shiftKey)
			key = "shift+"+key;
		if (e.altKey)
			key = "alt+"+key;

		// console.log(e.keyCode);

		if (keys[key]) {
			main.events(keys[key])();
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
});

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
}
function selectModalTab(tabNode) {
	// $(".tabs .tab").removeClass("active");
	$(tabNode).siblings().removeClass("active");
	$(tabNode).addClass("active");

	tabID = $(tabNode).attr("data-tab");

	$(tabNode).parents(".params").find(".param").removeClass("active");
	const $currentTab = $(tabNode).parents(".params").find(".param[data-tab=" + tabID + "]")
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
async function sendSQLQuery(){
	/*if (!main.deviceHost){
		notificate('Device connection error');
		return
	}*/

	const query_params = {
		device_host: main.deviceHost || '',
		db_name: $('#db-name').val(),
		query: $('#sql-query').val(),
		params: $('#query-params').val()
	};
	//const result = await sendSqlQueryToDevice(query_params);
	var result = {
    "error": "",
    "content": "barcode | id_good | id_property | id_series | id_unit\r\n2000000058429 | 7b7230d4-9257-11e3-8058-0015e9b8c48d |  |  | \r\n2000000058436 | 7b7230d6-9257-11e3-8058-0015e9b8c48d |  |  | \r\n2000000000015 | cbcf492a-55bc-11d9-848a-00112f43529a |  |  | \r\n2000000000022 | cbcf492a-55bc-11d9-848a-00112f43529a |  |  | f06588a7-7924-11df-b33a-0011955cba6b\r\n2000000000039 | 391e9547-702e-11e6-accf-0050568b35ac | 5cff86b4-702e-11e6-accf-0050568b35ac |  | \r\n2000000000046 | 391e9547-702e-11e6-accf-0050568b35ac | c4cd76df-702e-11e6-accf-0050568b35ac |  | \r\n2000000000060 | cbcf4968-55bc-11d9-848a-00112f43529a |  |  | \r\n2000000000077 | cbcf4980-55bc-11d9-848a-00112f43529a |  |  | \r\n2000000000121 | bd72d913-55bc-11d9-848a-00112f43529a | 3df1947d-7886-11df-b33a-0011955cba6b |  | dff7f708-7a0b-11df-b33a-0011955cba6b\r\n2000000000138 | bd72d913-55bc-11d9-848a-00112f43529a | 3df1947d-7886-11df-b33a-0011955cba6b |  | f0e40f7b-7390-11df-b338-0011955cba6b\r\n",
    "data": {
        "header": "barcode | id_good | id_property | id_series | id_unit",
        "data": [
            "2000000058429 | 7b7230d4-9257-11e3-8058-0015e9b8c48d |  |  | ",
            "2000000058436 | 7b7230d6-9257-11e3-8058-0015e9b8c48d |  |  | ",
            "2000000000015 | cbcf492a-55bc-11d9-848a-00112f43529a |  |  | ",
            "2000000000022 | cbcf492a-55bc-11d9-848a-00112f43529a |  |  | f06588a7-7924-11df-b33a-0011955cba6b",
            "2000000000039 | 391e9547-702e-11e6-accf-0050568b35ac | 5cff86b4-702e-11e6-accf-0050568b35ac |  | ",
            "2000000000046 | 391e9547-702e-11e6-accf-0050568b35ac | c4cd76df-702e-11e6-accf-0050568b35ac |  | ",
            "2000000000060 | cbcf4968-55bc-11d9-848a-00112f43529a |  |  | ",
            "2000000000077 | cbcf4980-55bc-11d9-848a-00112f43529a |  |  | ",
            "2000000000121 | bd72d913-55bc-11d9-848a-00112f43529a | 3df1947d-7886-11df-b33a-0011955cba6b |  | dff7f708-7a0b-11df-b33a-0011955cba6b",
            "2000000000138 | bd72d913-55bc-11d9-848a-00112f43529a | 3df1947d-7886-11df-b33a-0011955cba6b |  | f0e40f7b-7390-11df-b338-0011955cba6b"
        ]
    }
}
	if (result){
		if (result.error){
			notificate(result.content);
		} else {
			modal = ModalWindow.getCurrentModal();
			modal.renderSqlQueryResult(result.data);
		}
	}
}

