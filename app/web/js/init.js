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
		let type   = $(this).parents(selectors.listItem).attr('data-type'),
			parentType = $(this).parents(selectors.listItem).attr('data-parent-type'),
			path   = $(this).parents(selectors.listItem).attr('data-path'),
			modalTitle   = $(this).parents(selectors.listItem).find(".item-name").text(),
			modals = $(selectors.modal),
			lastModal = modals.last(),
			modalPath = modals.last().length > 0 ? modals.last().find(".modal-head").find(".path").text() + " / " + modalTitle: modalTitle;

		modal = addModal("", type, path, parentType, modalTitle, modalPath);
		modals.removeClass("active");
		modal.addClass("active");
		main.renderModalParams(modal, type, path, parentType);
	})

	$(document).on('click', selectors.listItem, function(){
		$(this).parents(selectors.list).find(selectors.listItem).removeClass("active");
		$(this).addClass("active");
	})

	$(document).on('click', selectors.btnDelete, function(){
		if (confirm('Вы уверены?')) {
			let listNode = $(this).parents(selectors.list),
				type = $(this).parents(selectors.listItem).attr('data-type'),
				path = $(this).parents(selectors.listItem).attr('data-path'),
				newPath = main.pathPop(path);

			main.deleteElement(type, path);
			main.renderElementsList(listNode, type, newPath);
			listNode.find(selectors.listItem).removeClass("active");

			if (type == "Process") {
				if ($("#processes .list-item").length > 0) {
					main.renderElementsList($(selectors.operationsList), "Operation", "0");
					listNode.find(selectors.listItem).removeClass("active");
					listNode.find(selectors.listItem).first().addClass("active");
				} else {
					$(selectors.operationsList).html("Select process");
				}
			}
		}
	})

	$(document).on('click', selectors.btnSave, function(){
		let modal       = $(this).parents(selectors.modal),
			type        = modal.attr('data-type'),
			path        = modal.attr('data-path'),
			parentModal = modal.prev();

		params = main.getElementParamsByForm(modal);
		main.saveElement(params, type, path);
		
		if (parentModal.length > 0) {
			main.renderElementsList(parentModal.find(".elements"), "", parentModal.attr("data-path"));
			main.renderElementsList(parentModal.find(".handlers"), "Handlers", parentModal.attr("data-path"));
			parentModal.addClass("active");

		} else if (type == "Process") {
			main.renderElementsList($(selectors.processList), "Process", "");

		} else if (type == "Operation") {
			path = main.pathPop(path);
			main.renderElementsList($(selectors.operationsList), "Operation", path);
		} else if (type == "CommonHandler") {
			main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
		}
		if (parentModal.length == 0) {
			$('.content').removeClass("blur");
		}

		closeModal(modal);
	})

	$(document).on('click', selectors.btnAdd, function(e){
		let listNode = $(this).parents(selectors.list),
			type     = $(this).attr("data-type"),
			path     = $(this).attr("data-path");

		main.addElement(type, path);
		main.renderElementsList(listNode, type, path);
	})

	$(document).on('click', '#processes .list-item', function(e){
		if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
			let path = $(this).attr("data-path");

			main.renderElementsList($(selectors.operationsList), "Operation", path);
			showList($("#main-conf-screen .section-header"), "down");
			$(selectors.operationsList).find(selectors.btnAdd).attr("data-path", $(this).attr("data-path"));
		}
	})

	$(document).on('click', '.main-conf-wrap .section-header', function(e){
		hideMain();
	})

	$(document).on('change', 'select.element-type', function(){
		let modal = $(this).parents(selectors.modal),
			type  = $(this).val(),
			parentType = modal.attr('data-parent-type'),
			path  = modal.attr("data-path");

		params = main.getElementParamsByForm(modal);
		main.saveElement(params, type, path);
		main.renderModalParams(modal, type, path, parentType);
	})

	$(document).on('change', '.form :input', function(){
		paramName = $(this).attr("data-param-name");
		paramValue = $(this).val();
		params = {};
		params[paramName] = paramValue;

		main.saveElement(params, "Configuration", "");
	})

	$(document).on('click', selectors.btnCloseModal, function(){
		let	modal       = $(this).parents(selectors.modal),
			parentModal = modal.prev();
			
		closeModal($(this).parents(selectors.modal));

		if (parentModal.length > 0) {
			parentModal.addClass("active");
		} else {
			$('.content').removeClass("blur");
		}
	});

    window.onbeforeunload = function (e) {
        return e
    };
});