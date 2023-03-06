$(document).ready(function(){
	$(document).on('click', selectors.btnEdit, function(){
		let type   = $(this).parents(selectors.listItem).attr('data-type'),
			parentType = $(this).parents(selectors.listItem).attr('data-parent-type'),
			path   = $(this).parents(selectors.listItem).attr('data-path'),
			modals = $(selectors.modal);

		modal = addModal("", type, path, parentType);
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
			main.renderElementsList($(selectors.handlersList), "CommonHandler", path);
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
});

var Main = {
	renderConfiguration: function () {
		let configuration = this.conf.ClientConfiguration;

		$.each(configuration, function(confParamName, confParamValue){
			if (typeof confParamValue !== 'object') {
				inputNode = $("#"+confParamName);

				if (inputNode.length > 0) {
					inputNode.val(confParamValue);
				}
			}
		})
	},
	renderElementsList: function (listNode, type, path) {
		let elementsItems = {},
			nameProp      = "type",
			btnType       = type,
			elementInfo   = this.getElementByPath(type, path),
			elementPath   = "",
			parentType    = "";

		if (type == "Process" || type == "Configuration") {
			nameProp = "ProcessName";
			elements = elementInfo.parent.Processes;
		} else if (type == "CommonHandler") {
			nameProp = "event";
			elements = elementInfo.parent.CommonHandlers;
		} else if (type == "Handlers") {
			nameProp = "event";
			elements = elementInfo.parent.Handlers;
		} else if (type == "Operation") {
			nameProp = "Name";
			elements = elementInfo.parent.Operations;
		} else {
			elements = elementInfo.element.Elements;
			parentType = elementInfo.element.type;
			btnType = "Elements";
		}

		if (path != "") 
			elementPath = String(path)+"-";

		$.each(elements, function(elementIndex, elementParams){
			let elementName = elementParams[nameProp],
				elementType = elementParams.type;

			if (type == "CommonHandler")
				elementType = "CommonHandler";

			if (type == "Handlers")
				elementType = "Handlers";

			if (typeof elementName !== 'undefined') {
				elementsItems[elementIndex] = {
					itemName: elementName,
					dataAttr: {
						"type": elementType,
						"parent-type": parentType,
						"path": elementPath+String(elementIndex),
					}
				};
			}
		});

		this.renderList(listNode, elementsItems, btnType, path);
	},
	renderList: function (parentNode, items, type, path) {
		html = '<div class="btn-group"><button class="btn-add" data-type="'+type+'" data-path="'+path+'">Add</button></div>';

		if (Object.keys(items).length > 0) {
			activeNodePath = String(parentNode.find(".list-item.active").attr("data-path"));

			$.each(items, function (itemIndex, item) {
				if (activeNodePath == item.dataAttr.path) {
					html += '<li class="list-item active" ';
				} else {
					html += '<li class="list-item" ';
				}
	
				$.each(item["dataAttr"], function (attrName, attrValue) {
					html += 'data-'+attrName+'="'+attrValue+'"';
				})
	
				html += '><span class="item-name">'+item["itemName"]+'</span><div class="item-btn"><span class="edit">edit</span><span class="delete">delete</span></div></li>';
			});
		} else {
			html += "No Items";
		}

		parentNode.html(html);
	},
	renderModalParams: function (modalNode, type, path, parentType) {
		element  = this.getElementByPath(type, path).element;
		html     = '<div class="params">';
		renderElements = false;
		renderHandlers = false;
		elementParams = this.elementParams;

		if (type == "Process") {
			elementName = element.ProcessName;
		} else if (type == "CommonHandler") {
			elementName = element.event;
		} else if (type == "Operation") {
			elementName = element.Name;
		} else {
			elementName = type;
		}

		pathText = this.getElementByPath(type, path).path;

		modalNode.find(selectors.modalTitle).text(elementName);
		modalNode.find(".path").text(pathText);

		$.each(elementParams[type], function (configName, paramFields) {
			if (paramFields["type"] != "operations") {
				value = "";
				html += '<div class="param">';

				if (paramFields["type"] == "text") {
					if (typeof element[configName] != 'undefined') {
						value = element[configName];
					}

					html += '<label for="'+configName+'">'+paramFields["text"]+'</label>';
					html += "<input type='text' name='"+configName+"' id='"+configName+"' data-param-name='"+configName+"' value='"+value+"'>";
				}

				if (paramFields["type"] == "checkbox") {
					if (typeof element[configName] != 'undefined') {
						value = element[configName] == true ? 'checked' : '';
					}

					html += '<label for="'+configName+'">'+paramFields["text"]+'</label>';
					html += '<input type="checkbox" name="'+configName+'" id="'+configName+'" data-param-name="'+configName+'" '+value+'>';
				}

				if (paramFields["type"] == "select") {
					html += '<label>'+paramFields["text"]+'</label>';
					
					if (typeof element[configName] != 'undefined') {
						value = element[configName];
					}

					if (typeof paramFields["class"] != "undefined") {
						html += '<select data-param-name="'+configName+'" class="'+paramFields["class"]+'">';	
					} else {
						html += '<select data-param-name="'+configName+'">';
					}

					$.each(paramFields["options"], function (optionIndex, optionValue) {
						if (optionValue == element[configName]) {
							html += '<option value="'+optionValue+'" selected>'+optionValue+'</option>'	;
						} else {
							html += '<option value="'+optionValue+'">'+optionValue+'</option>';
						}
					})

					html += '</select>';
				}

				if (paramFields["type"] == "elements") {
					html += '<label onclick="showList(this)">'+paramFields["text"]+'<i class="fa fa-angle-down" aria-hidden="true"></i></label><div class="list-wrap" style="display: none;">';
					html += '<ul class="list elements">No elements</ul></div>';
					renderElements = true;
				}

				if (paramFields["type"] == "handlers") {
					html += '<label onclick="showList(this)">'+paramFields["text"]+'<i class="fa fa-angle-down" aria-hidden="true"></i></label><div class="list-wrap" style="display: none;">';
					html += '<ul class="list handlers">No Handlers</ul></div>';
					renderHandlers = true;
				}

				if (configName == "type") {
					$.each(paramFields, function(index, typeOptions) {
						if (typeOptions.parent == parentType) {
							html += '<label>'+typeOptions["text"]+'</label>';
							
							if (typeof element[configName] != 'undefined') {
								value = element[configName];
							}

							//if (typeof paramFields["class"] != "undefined") {
								html += '<select data-param-name="'+configName+'" class="element-type">';	
							//} else {
								//html += '<select data-param-name="'+configName+'">';
							//}

							$.each(typeOptions["options"], function (optionIndex, optionValue) {
								if (optionValue == element[configName]) {
									html += '<option value="'+optionValue+'" selected>'+optionValue+'</option>'	;
								} else {
									html += '<option value="'+optionValue+'">'+optionValue+'</option>';
								}
							})

							html += '</select>';
						}
					})
				}

				html += '</div>';
			}
		})

		html += '<div class="btn-group modal-btn"><button class="save-element">Save</button></div></div>';

		modalNode.find(selectors.modalContent).html(html);

		if (renderElements)
			this.renderElementsList(modalNode.find('.elements'), "Elements", path);

		if (renderHandlers)
			this.renderElementsList(modalNode.find('.handlers'), "Handlers", path);
	},
	saveElement: function (params, type, path) {
		element = this.getElementByPath(type, path).element;

		$.each(params, function (paramName, paramValue) {
			element[paramName] = paramValue;
		})

	},
	deleteElement: function (type, path) {
		let parent     = this.getElementByPath(type, path).parent,
			arrPath      = String(path).split('-'),
			elementIndex = arrPath[arrPath.length - 1];

		if (type == "Process") {
			parent.Processes.splice(elementIndex, 1);
		} else if (type == "Operation") {
			parent.Operations.splice(elementIndex, 1);
		} else if (type == "CommonHandler") {
			parent.CommonHandlers.splice(elementIndex, 1);
		} else if (type == "Handlers") {
			parent.Handlers.splice(elementIndex, 1);
		} else {
			parent.Elements.splice(elementIndex, 1);
		}
	},
	addElement: function (type, path) {
		elementInfo = this.getElementByPath(type, path);
		newElement = newElements[type];

		if (type == "Process") {
			elements = elementInfo.parent.Processes;
		} else if (type == "Operation") {
			elements = elementInfo.parent.Operations;
		}  else if (type == "CommonHandler") {
			elements = elementInfo.parent.CommonHandlers;
		}  else if (type == "Handlers") {
			elements = elementInfo.parent.Handlers;
		} else {
			elements = elementInfo.element.Elements;
		}

		length = elements.push(newElement);
	},
	getElementParamsByForm: function (elemntParamsNode) {
		inputs = elemntParamsNode.find(":input");
		params = {};

		for (var i = 0; i < inputs.length; i++) {
			paramValue = $(inputs[i]).val();
			paramName  = $(inputs[i]).attr("data-param-name");

			if (typeof paramName != 'undefined') {
				if ($(inputs[i]).attr("type") == "checkbox") {
					if ($(inputs[i]).is(':checked')) {
						paramValue = true;
					} else {
						paramValue = false;
					}
				}

				params[paramName] = paramValue;
			}
		}

		return params;
	},
	getElementByPath: function (type, path) {
		let res = {
				element: this.conf.ClientConfiguration,
				parent: {},
				elements: {},
				path: ""
			}

		arrPath = String(path).split('-');

		if (type == "Configuration") {
			return res;
		}

		if (type == "Process") {
			res.parent    = res.element;
			res.element   = res.element.Processes[arrPath[0]];

		} else if (type == "CommonHandler") {
			res.parent    = res.element;
			res.element   = res.element.CommonHandlers[arrPath[0]];

		} else if (type == "Handlers") {
			processIndex   = arrPath[0];
			operationIndex = arrPath[1];
			handlersIndex  = arrPath[2];
			res.parent     = res.element.Processes[processIndex].Operations[operationIndex];
			res.element    = res.element.Processes[processIndex].Operations[operationIndex].Handlers[handlersIndex];

		} else if (type == "Operation") {
			processIndex   = arrPath[0];
			operationIndex = arrPath[1];
			res.parent     = res.element.Processes[processIndex];
			res.element    = res.element.Processes[processIndex].Operations[operationIndex];

		} else {
			processIndex   = arrPath[0];
			operationIndex = arrPath[1];
			res.parent     = res.element.Processes[processIndex].Operations[operationIndex];
			res.element    = res.element.Processes[processIndex].Operations[operationIndex];

			arrPath.splice(0, 2);

			for (var i = 0; i < arrPath.length; i++) {
				res.parent  = res.element;
				res.element = res.element.Elements[arrPath[i]];
			}
		}

		return res;
	},
	pathPop: function (path) {
		arrPath = String(path).split('-');
		arrPath.pop();
		path    = arrPath.join("-");

		return path;
	}
}

async function pick_file() {
	await eel.ask_file('simple_ui')().then(async (result) => {
		filePath = result.file_path;

		await eel.load_configuration(filePath)().then(conf => {
			$(".hidden-conf-json").text(JSON.stringify(conf));
			main.conf = conf;
			clearMainSection();
			main.renderConfiguration();
			main.renderElementsList($(selectors.processList), "Process", "");
			main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
			$(".file-path").text(filePath);
		});
	});
}

async function pickNewFileProject() {
	await eel.ask_save_file('simple_ui')().then(async (result) => {
		filePath = result.file_path;
		if (filePath.trim() != ''){
			await eel.get_new_configuration()().then(conf => {
				$(".hidden-conf-json").text(JSON.stringify(conf));
				main.conf = conf;
				clearMainSection();
				main.renderConfiguration();
				main.renderElementsList($(selectors.processList), "Process", "");
				main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
				$(".file-path").text(filePath);
			});
		}
	});
}

const fileLocationSave = async (event) => {
    const data = main.conf;
    filePath = $('.file-path').text();
    result_save = await eel.save_configuration(data, filePath)();

	if (result_save.result == 'success') {
		notificate('Файл успешно сохранен', 'success')
	}else{
		notificate('Ошибка сохранения файла: ' + result_save.msg, 'danger')
	}
};

const showQRSettings = async (event) => {
    let img = document.getElementById("qr-preview"),
    	imgBase64 = await getQRByteArrayAsBase64(),
    	img_src = "data:image/png;base64, " + imgBase64;

    modal = addModal('qr', '', '');
    modal.append("<img src='"+img_src+"'>");
}

const getQRByteArrayAsBase64 = async () => {
    result = await eel.get_qr_settings()();
    return result
};

async function get_config_ui_elements() {
	await eel.get_config_ui_elements()().then(async (result) => {
		console.log(result)
		main.elementParams = result;
	});
}

eel.expose(get_current_file_path);
function get_current_file_path () {
    return $('.file-path').text();
};

function clearMainSection () {
	$(selectors.processList).html("No processes");
	$(selectors.operationsList).html("No operations");
	$(selectors.handlersList).html("No handlers");
}

function addModal (className, type, path = "", parentType = "") {
	$("#modals-wrap").addClass("active");
	modal = $("<div class='modal "+className+"' data-type='"+type+"' data-parent-type='"+parentType+"' data-path='"+path+"'><div class='close-modal'><i class='fa fa-times' aria-hidden='true'></i></div><div class='modal-head'><h2 class='modal-title'></h2><span class='path'></span></div><div class='modal-content'></div></div>").appendTo("#modals-wrap");
	$('.content').addClass("blur");

	return modal;
}

function closeModal (modalNode) {
	if (modalNode.siblings(selectors.modal).length == 0) {
		modalNode.parents("#modals-wrap").removeClass("active");
	}
	modalNode.remove();
}

function showList (node, direction = "toggle") {
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

window.onbeforeunload = function (e) {
	var dialogText = 'Dialog text here';
	e.returnValue = dialogText;
	return dialogText;
};