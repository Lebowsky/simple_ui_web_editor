$(document).ready(function(){
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
		const item = $(this).parents(selectors.listItem).find(".item-name");
		const elementId = item.attr('data-id');
		const element = main.configGraph.getElementById(elementId);

		modal = new ElementModal(element);
		modal.render().show();
	})
	$(document).on('click', selectors.btnDelete, function(){
		if (confirm('Вы уверены?')) {
			const item = $(this).parents(selectors.listItem).find(".item-name");
			const elementId = item.attr('data-id');
			const element = main.configGraph.getElementById(elementId);
			const type = element.parentType;
			const node = element.parentConfig['node'];
			const parentId = element.parentId;

			main.configGraph.removeElement(element);
			main.configGraph.fillListElementValues(type, node, parentId);
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
		main.configGraph.fillListElementValues(element.parentType, element.parentConfig['node'], element.parentId)
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
	$(document).on('click', selectors.listItem, function(){
		$(this).parents(selectors.list).find(selectors.listItem).removeClass("active");
		$(this).addClass("active");
	})
	$(document).on('click', '#processes .list-item', function(e){
		if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
			const elementId = $(this).children('span.item-name').attr('data-id');
			main.configGraph.fillListElementsByParent(elementId, selectors.operationsList);
		// 	let path = $(this).attr("data-path");

		// 	main.renderElementsList($(selectors.operationsList), "Operation", path);
			showList($("#main-conf-screen .section-header"), "down");
		// 	$(selectors.operationsList).find(selectors.btnAdd).attr("data-path", $(this).attr("data-path"));
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
		// if (typeof $(this).attr("data-param-name") == 'undefined')
		// 	return

		// paramName = $(this).attr("data-param-name");
		// paramValue = $(this).val();
		// params = {};
		// params[paramName] = paramValue;

		// main.saveElement(params, "Configuration", "");
	})
	$(window).keyup(function(e) {
		key = e.keyCode;

		if (e.ctrlKey)
			key = "ctrl+"+key;
		if (e.shiftKey)
			key = "shift+"+key;
		if (e.altKey)
			key = "alt+"+key;

		console.log(e.keyCode);

		if (typeof(keys[key]) != "undefined") {
			events[keys[key]]();
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