$(document).ready(function(){
	$(document).on('click', '.list-item .edit', function(){
		let type   = $(this).parents(".list-item").attr('data-type'),
			path   = $(this).parents(".list-item").attr('data-path'),
			modals = $(".modal");

		modal = addModal("", type, path);
		modals.removeClass("active");
		modal.addClass("active");
		main.renderModalParams(modal, type, path);
	})

	$(document).on('click', '.list-item', function(){
		$(this).parents(".list").find(".list-item").removeClass("active");
		$(this).addClass("active");
	})

	$(document).on('click', '.list-item .delete', function(){
		if (confirm('Вы уверены?')) {
			let listNode = $(this).parents(".list"),
				type = $(this).parents(".list-item").attr('data-type'),
				path = $(this).parents(".list-item").attr('data-path'),
				newPath = main.pathPop(path);

			main.deleteElement(type, path);
			main.renderElementsList(listNode, type, newPath);
			listNode.find(".list-item").removeClass("active");

			if (type == "Process") {
				if ($("#processes .list-item").length > 0) {
					main.renderElementsList($("#operations"), "Operation", "0");
					listNode.find(".list-item").removeClass("active");
					listNode.find(".list-item").first().addClass("active");
				} else {
					$("#operations").html("Select process");
				}
			}
		}
	})

	$(document).on('click', '.save-element', function(){
		let modal       = $(this).parents(".modal"),
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
			main.renderElementsList($("#processes"), "Process", "");

		} else if (type == "Operation") {
			path = main.pathPop(path);
			main.renderElementsList($("#operations"), "Operation", path);
		} else if (type == "CommonHandlers") {
			main.renderElementsList($("#handlers"), "CommonHandlers", path);
		}
		if (parentModal.length == 0) {
			$('.content').removeClass("blur");
		}

		closeModal(modal);
	})

	$(document).on('click', '.btn-add', function(e){
		let listNode = $(this).parents(".list"),
			type     = $(this).attr("data-type"),
			path     = $(this).attr("data-path");

		main.addElement(type, path);
		main.renderElementsList(listNode, type, path);
	})

	$(document).on('click', '#processes .list-item', function(e){
		if ($(e.target).is(this) || $(e.target).is($(this).children("span"))) {
			let path = $(this).attr("data-path");

			main.renderElementsList($("#operations"), "Operation", path);
			showList($("#main-conf-screen .section-header"), "down");
			$("#operations").find(".btn-add").attr("data-path", $(this).attr("data-path"));
		}
	})

	$(document).on('change', 'select.element-type', function(){
		let modal = $(this).parents(".modal"),
			type  = $(this).val(),
			path  = modal.attr("data-path");

		params = main.getElementParamsByForm(modal);
		main.saveElement(params, type, path);
		console.log(type)
		main.renderModalParams(modal, type, path);
	})

	$(document).on('change', '.form :input', function(){
		paramName = $(this).attr("data-param-name");
		paramValue = $(this).val();
		params = {};
		params[paramName] = paramValue;

		main.saveElement(params, "Configuration", "");
	})

	$(document).on('click', '.close-modal', function(){
		let	modal       = $(this).parents(".modal"),
			parentModal = modal.prev();
			
		closeModal($(this).parents(".modal"));

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
			elementInfo   = this.getElementByPath(type, path),
			elementPath   = "";

		if (type == "Process" || type == "Configuration") {
			nameProp = "ProcessName";
			elements = elementInfo.parent.Processes;
		} else if (type == "CommonHandlers") {
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
		}

		if (path != "") 
			elementPath = String(path)+"-";

		$.each(elements, function(elementIndex, elementParams){
			let elementName = elementParams[nameProp],
				elementType = elementParams.type;

			if (type == "CommonHandlers")
				elementType = "CommonHandlers";

			if (type == "Handlers")
				elementType = "Handlers";

			if (typeof elementName !== 'undefined') {
				elementsItems[elementIndex] = {
					itemName: elementName,
					dataAttr: {
						"type": elementType,
						"path": elementPath+String(elementIndex),
					}
				};
			}
		});

		this.renderList(listNode, elementsItems, type, path);
	},
	renderList: function (parentNode, items, type, path) {
		html = '<div class="btn-group"><button class="btn-add" data-type="'+type+'" data-path="'+path+'">Add</button></div>';

		//console.log($(parentNode))

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
	renderModalParams: function (modalNode, type, path) {
		element  = this.getElementByPath(type, path).element;
		html     = '<div class="params">';

		if (type == "Process") {
			elementName = element.ProcessName;
		} else if (type == "CommonHandlers") {
			elementName = element.event;
		} else if (type == "Operation") {
			elementName = element.Name;
		} else {
			elementName = type;
		}

		pathText = this.getElementByPath(type, path).path;

		modalNode.find(".modal-title").text(elementName);
		modalNode.find(".path").text(pathText);

		$.each(elementParams[type], function (configName, paramFields) {
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

			if (paramFields["type"] == "Elements") {
				html += '<label onclick="showList(this)">'+paramFields["text"]+'<i class="fa fa-angle-down" aria-hidden="true"></i></label><div class="list-wrap" style="display: none;">';
				html += '<ul class="list elements">No elements</ul></div>';
			}

			if (paramFields["type"] == "Handlers") {
				html += '<label onclick="showList(this)">'+paramFields["text"]+'<i class="fa fa-angle-down" aria-hidden="true"></i></label><div class="list-wrap" style="display: none;">';
				html += '<ul class="list handlers">No Handlers</ul></div>';
			}

			html += '</div>';
		})

		html += '<div class="btn-group modal-btn"><button class="save-element">Save</button></div></div>';

		modalNode.find(".modal-content").html(html);

		this.renderElementsList(modalNode.find('.elements'), "Elements", path);
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
		} else if (type == "CommonHandlers") {
			parent.CommonHandlers.splice(elementIndex, 1);
		} else if (type == "Handlers") {
			parent.Handlers.splice(elementIndex, 1);
		} else {
			parent.Elements.splice(elementIndex, 1);
		}
	},
	addElement: function (type, path) {
		elementInfo = this.getElementByPath(type, path);

		if (type == "Process") {
			elementName = "New Process";
			newElement = {
	            type: "Process",
	            ProcessName: elementName,
	            PlanFactHeader: "",
	            DefineOnBackPressed: false,
	            hidden: false,
	            login_screen: false,
	            SC: false,
		        Operations: []
			}
		}
		if (type == "Operation") {
			elementName = "New Screen";
			newElement = {
                type: "Operation",
                Name: elementName,
                Timer: false,
                hideToolBarScreen: false,
                noScroll: false,
                handleKeyUp: false,
                noConfirmation: false,
                hideBottomBarScreen: false,
                onlineOnStart: false,
                send_when_opened: false,
                onlineOnInput: false,
                DefOnlineOnCreate: "",
                DefOnlineOnInput: "",
                DefOnCreate: "",
                DefOnInput: "",
                Elements: [],
                Handlers: [],
                onlineOnAfterStart: false
			}
		}
		if (type == "Elements") {
			newElement = {
                Value: "",
                Variable: "",
                type: "LinearLayout",
                weight: "",
                height: "",
                width: "",
                orientation: "",
                Elements: [],
                BackgroundColor: "",
                StrokeWidth: "",
                Padding: ""
            }
		}
		if (type == "CommonHandlers") {
			newElement = {
                type: "",
                action: "",
                event: "onLaunch",
                method: "",
                postExecute: "",
                alias: ""
            }
		}
		if (type == "Handlers") {
			newElement = {
                type: "",
                action: "",
                event: "onLaunch",
                method: "",
                postExecute: "",
            }
		}

		if (type == "Process") {
			elements = elementInfo.parent.Processes;
		} else if (type == "Operation") {
			elements = elementInfo.parent.Operations;
		}  else if (type == "CommonHandlers") {
			elements = elementInfo.parent.CommonHandlers;
		}  else if (type == "Handlers") {
			elements = elementInfo.parent.Handlers;
		} else {
			console.log(path)
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

		} else if (type == "CommonHandlers") {
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
			main.renderElementsList($("#processes"), "Process", "");
			main.renderElementsList($("#handlers"), "CommonHandlers", "");
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
				main.renderElementsList($("#processes"), "Process", "");
				main.renderElementsList($("#handlers"), "CommonHandlers", "");
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

//get_config_ui_elements();

async function get_config_ui_elements() {
	await eel.get_config_ui_elements()().then(async (result) => {
		console.log(result);
	});
}

eel.expose(get_current_file_path);
function get_current_file_path () {
    return $('.file-path').text();
};

function clearMainSection () {
	$("#processes").html("No processes");
	$("#operations").html("No operations");
	$("#handlers").html("No handlers");
}

function addModal (className, type, path = "") {
	$("#modals-wrap").addClass("active");
	modal = $("<div class='modal "+className+"' data-type='"+type+"' data-path='"+path+"'><div class='close-modal'><i class='fa fa-times' aria-hidden='true'></i></div><div class='modal-head'><h2 class='modal-title'></h2><span class='path'></span></div><div class='modal-content'></div></div>").appendTo("#modals-wrap");
	$('.content').addClass("blur");

	return modal;
}

function closeModal (modalNode) {
	if (modalNode.siblings(".modal").length == 0) {
		modalNode.parents("#modals-wrap").removeClass("active");
	}
	modalNode.remove();
}

function showList (node, direction = "toggle") {
	if (direction == "up") {
		$(node).siblings(".list-wrap").slideUp();
		$(node).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
	} else if (direction == "down") {
		$(node).siblings(".list-wrap").slideDown();
		$(node).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
	} else {
		$(node).siblings(".list-wrap").slideToggle();

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