var Main = {
	renderConfiguration: function () {
		let configuration = this.conf.ClientConfiguration;

		$.each(configuration, function(confParamName, confParamValue){
			if (typeof confParamValue !== 'object') {
				inputNode = $("#"+confParamName);

				if (inputNode.length > 0) {
					if (typeof confParamValue == 'boolean')
						inputNode.prop('checked', confParamValue);
					else
						inputNode.val(confParamValue);
				}
			}
		})
		$.each(this.conf.ClientConfiguration.ConfigurationSettings, function(confParamName, confParamValue){
			if (typeof confParamValue !== 'object') {
				inputNode = $("#"+confParamName);

				if (inputNode.length > 0) {
					if (typeof confParamValue == 'boolean')
						inputNode.prop('checked', confParamValue);
					else
						inputNode.val(confParamValue);
				}
			}
		})
	},
	renderListElements: (elements) => {
		$.each(elements, (key, value) => {
			const elementData = main.getElementDataByPath(value.type, value.path)
			const renderParams = {
				...value,
				parentType: value.type,
				path: value.path,
				items: elementData.parent[key],
				
				activeNodePath: String($(value.node).find(".list-item.active").attr("data-path"))
			}
			$(value.node).html(getRenderListElement(renderParams));	
		});
	},
	renderElementsList: function (listNode, type, path='') {
		let elementsItems = {},
			nameProp      = "type",
			btnType       = type,
			elementInfo   = this.getElementByPath(type, path),
			elementPath   = "",
			parentType    = "";

		if (type == "Process" || type == "Configuration") {
			nameProp = "ProcessName";
			elements = elementInfo.parent.Processes;
			if (type == "Process") {
				parentType = "Process";
			} else if (type == "Configuration") {
				parentType = "Configuration";
			}
		} else if (type == "CommonHandler") {
			nameProp = "event";
			elements = elementInfo.parent.CommonHandlers;
		} else if (type == "PyFiles") {
			nameProp = "PyFileKey";
			elements = elementInfo.parent.PyFiles;
		} else if (type == "Handlers") {
			nameProp = "event";
			elements = elementInfo.parent.Handlers;
			parentType = "handlers";
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

			if (type == "PyFiles")
				elementType = "PyFiles";

			if (typeof elementName !== 'undefined') {
				elementsItems[elementIndex] = {
					itemName: elementName,
					dataAttr: {
						"type": elementType,
						//"parent-type": parentType,
						"path": elementPath+String(elementIndex),
					}
				};
			}
		});

		this.renderList(listNode, elementsItems, btnType, path, parentType);
	},
	renderList: function (parentNode, items, type, path, parentType) {
		html = '<div class="btn-group"><button class="btn-add" data-type="'+type+'" data-parent-type="'+parentType+'" data-path="'+path+'">Add</button></div>';

		if (Object.keys(items).length > 0) {
			activeNodePath = String(parentNode.find(".list-item.active").attr("data-path"));

			$.each(items, function (itemIndex, item) {
				if (activeNodePath == item.dataAttr.path) {
					html += '<li class="list-item active" ';
				} else {
					html += '<li class="list-item" ';
				}
				
				html += 'data-parent-type="'+parentType+'"';
	
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
		arrTabs = Object.keys(elementParams[type]["tabs"]);

		const namePath = {
			Process: element.ProcessName,
			CommonHandler: element.event,
			Operation: element.Name
		}
		elementName = namePath[type] || type

		pathText = this.getElementByPath(type, path).path;

		if (arrTabs.length > 1) {
			html += "<div class='tabs'>";
			$.each(elementParams[type]["tabs"], function (tabName, tabValue) {
				html += `<div onclick="selectModalTab(this)" class="tab ${tabName == arrTabs[0] ? 'active' : ''}" data-tab="${tabName}">${tabValue}</div>`;
			})
			html += "</div>";
		}

		$.each(elementParams[type], function (configName, paramFields) {
			let renderParams = {
				...paramFields,
				name: configName,
				value: element[configName],
			};

			if (paramFields["type"] && paramFields["type"] != "operations") {
				let isListParam = paramFields["type"] == "elements" || paramFields["type"] == "handlers";

				html += `
					<div class="param ${isListParam ? 'list-param' : ''} ${paramFields["tab_name"] == arrTabs[0] ? 'active' : ''}" data-tab="${paramFields["tab_name"]}">
					${getRenderModalElement(renderParams)}
					</div>
				`
				if (paramFields["type"] == "elements")
					renderElements = true;

				if (paramFields["type"] == "handlers")
					renderHandlers = true;

			}else if (configName == "type") {
				renderParams.type = configName;
				renderParams.value = type;

				$.each(paramFields, function(index, typeOptions) {
					renderParams.text = typeOptions["text"]
					renderParams.options = typeOptions["options"]

					if (typeOptions.parent == parentType) {
						html += `
							<div class="param active" data-tab="${arrTabs[0]}">
							${getRenderModalElement(renderParams)}
							</div>
							`	
					}
				})
			};
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

		if (typeof element == 'undefined')
			return

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
		} else if (type == "PyFiles") {
			parent.PyFiles.splice(elementIndex, 1);
		} else if (type == "Handlers") {
			parent.Handlers.splice(elementIndex, 1);
		} else {
			parent.Elements.splice(elementIndex, 1);
		}
	},
	addElement: function (type, path) {
		elementInfo = this.getElementByPath(type, path);
		newElementsJson = JSON.stringify(newElements);
		newElementsConf = JSON.parse(newElementsJson);
		newElement = newElementsConf[type];

		if (type == "Process") {
			elements = elementInfo.parent.Processes;
		} else if (type == "Operation") {
			elements = elementInfo.parent.Operations;
		}  else if (type == "CommonHandler") {
			elements = elementInfo.parent.CommonHandlers;
		}  else if (type == "PyFiles") {
			elements = elementInfo.parent.PyFiles;
		}  else if (type == "Handlers") {
			elements = elementInfo.parent.Handlers;
		} else {
			elements = elementInfo.element.Elements;
		}

		length = elements.push(newElement);
		elementIndex = length-1;

		if (path != "") {
			elementPath = path+"-"+elementIndex;
		} else {
			elementPath = elementIndex;
		}

		newElement["path"] = elementPath;

		return newElement;
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
	getElementDataByPath: function (type, path){
		if (!this.conf){
			return {element: undefined}		
		};

		let elementData;
		let arrPath = String(path).split('-');
		const [mainIndex, operationIndex, handlersIndex] = arrPath
		const config = this.conf.ClientConfiguration
		const res = {
			element: config,
			parent: {},
			elements: {},
			path: ""
		}

		const elementsData = {
			Configuration: {
				...res
			},
			ConfigurationSettings: {
				...res,
				element: config.ConfigurationSettings,
			},
			Process: {
				...res,
				parent: res.element,
				element: config.Processes[mainIndex]
			},
			MainMenu: {
				...res,
				parent: res.element,
				element: config.MainMenu[mainIndex]		
			},
			CommonHandler: {
				...res,
				parent: res.element,
				element: config.CommonHandlers[mainIndex]
			},
			PyFiles: {
				...res,
				parent: res.element,
				element: config.PyFiles[mainIndex]
			},
			Handlers: {
				...res,
				parent: operationIndex ? config.Processes[mainIndex].Operations[operationIndex] : undefined,
				element: operationIndex ? config.Processes[mainIndex].Operations[operationIndex].Handlers[handlersIndex] : undefined,
			},
			Operation: {
				...res,
				parent: config.Processes[mainIndex],
				element: operationIndex ? config.Processes[mainIndex].Operations[operationIndex] : undefined
			},
		}

		elementData = elementsData[type]
		if (elementData)
			return elementData
		else {
			elementData = {
				...res,
				parent: config.Processes[mainIndex].Operations[operationIndex],
				element: config.Processes[mainIndex].Operations[operationIndex]
			}

			arrPath.splice(0, 2);

			for (var i = 0; i < arrPath.length; i++) {
				elementData.parent  = elementData.element;
				elementData.element = elementData.element.Elements[arrPath[i]];
			}
			return elementData
		}
	},
	getElementByPath: function (type, path) {
		return this.getElementDataByPath(type, path)

		if (typeof this.conf == 'undefined')
			return {element: undefined}

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

		if (type == "ConfigurationSettings") {
			res.element = res.element.ConfigurationSettings;
			return res;
		}

		if (type == "Process") {
			res.parent    = res.element;
			res.element   = res.element.Processes[arrPath[0]];

		} else if (type == "CommonHandler") {
			res.parent    = res.element;
			res.element   = res.element.CommonHandlers[arrPath[0]];

		} else if (type == "PyFiles") {
			res.parent    = res.element;
			res.element   = res.element.PyFiles[arrPath[0]];


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

function clearMainSection () {
	$(selectors.processList).html("No processes");
	$(selectors.operationsList).html("No operations");
	$(selectors.handlersList).html("No handlers");
}

function fillDefaultValues(){
	$.each(main.elementParams.ClientConfiguration, function(key, val){
		el = $('#' + key)
		if (el.length && val.default_value != undefined)
			if (val.type == 'checkbox')
				el.prop('checked', val.default_value)
			else if(val.type == 'text')
				el.val(val.default_value)
	});
}

function addModal (className, type, path = "", parentType = "", modalTitle, modalPath) {
	$("#modals-wrap").addClass("active");
	modal = $("<div class='modal "+className+"' data-type='"+type+"' data-parent-type='"+parentType+"' data-path='"+path+"'><div class='close-modal'><i class='fa fa-times' aria-hidden='true'></i></div><div class='modal-head'><h2 class='modal-title'>"+modalTitle+"<span class='edited'>*</span></h2><span class='path'>"+modalPath+"</span></div><div class='modal-content'></div></div>").appendTo("#modals-wrap");
	$('.content').addClass("blur");

	$("body").addClass("no-scroll");

	return modal;
}

function closeModal (modalNode) {
	if (modalNode.siblings(selectors.modal).length == 0) {
		modalNode.parents("#modals-wrap").removeClass("active");
	}
	
	parentModal = modalNode.prev();

	modalNode.remove();
	
	if ($(".modal").length == 0) {
		$("body").removeClass("no-scroll");
		$('.content').removeClass("blur");
	} else {
		parentModal.addClass("active");
	}
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

function hideMain () {
	if ($(".main-conf-wrap").hasClass("hide")) {
		$(".main-conf-wrap section .section-header").find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
	} else {
		$(".main-conf-wrap section .section-header").find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
	}

	$(".main-conf-wrap").toggleClass("hide");
}

function selectTab (tabNode) {
	$(".tabs .tab").removeClass("active");
	$(tabNode).addClass("active");

	tabID = $(tabNode).attr("data-tab-id");

	$(".main-conf-wrap section").removeClass("active");
	$(".main-conf-wrap #"+tabID).addClass("active");
}

function selectModalTab (tabNode) {
	$(".tabs .tab").removeClass("active");
	$(tabNode).addClass("active");

	tabID = $(tabNode).attr("data-tab");

	$(tabNode).parents(".params").find(".param").removeClass("active");
	$(tabNode).parents(".params").find(".param[data-tab="+tabID+"]").addClass("active");
}

function togglePrev () {
	$(".prev-wrap").toggleClass("show");
}

function loadPrev () {
    $("#prev .prev-content").html('<div class="preload">Load preview...</div><iframe onload="loadedPrev(this)" id="prev-if" src="http://localhost:5000/prev?'+Date.now()+'"></iframe>');
}

function loadedPrev (prevNode) {
	$(".preload").hide();
	$(prevNode).addClass("load");
}

var keys = {
	"27" : "closeModal", // Esc
	"ctrl+13" : "saveElementModal", // Ctrl+Enter
}

var events = {
	closeModal: function (modal = false) {
		if (modal === false) {
			modal = $("#modals-wrap .modal.active");
		}

		if (modal.length > 0) {
			confirmClose = true;

			if (modal.hasClass("edited")) {
				confirmClose = confirm('Закрыть без сохранения?');
			}

			if (confirmClose) {
				let parentModal = modal.prev();

				if (modal.hasClass("new")) {
					let type = modal.attr('data-type'),
						path = modal.attr('data-path');

					main.deleteElement(type, path);
					
					if (parentModal.length > 0) {
						main.renderElementsList(parentModal.find(".elements"), "", parentModal.attr("data-path"));
						main.renderElementsList(parentModal.find(".handlers"), "Handlers", parentModal.attr("data-path"));

					} else if (type == "Process") {
						main.renderElementsList($(selectors.processList), "Process", "");

					} else if (type == "Operation") {
						path = main.pathPop(path);
						main.renderElementsList($(selectors.operationsList), "Operation", path);
					} else if (type == "CommonHandler") {
						main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
					} else if (type == "PyFiles") {
						main.renderElementsList($(selectors.pyFilesList), "PyFiles", "");
					}
					if (parentModal.length == 0) {
						$('.content').removeClass("blur");
					}
				}

				closeModal(modal);
			}
		}
	},
	saveElementModal: function (modal = false) {
		if (modal === false) {
			modal = $("#modals-wrap .modal.active");
		}

		let parentModal = modal.prev();

		if (modal.length > 0) {
			let type        = modal.attr('data-type'),
				path        = modal.attr('data-path'),
				parentModal = modal.prev();

			params = main.getElementParamsByForm(modal);
			main.saveElement(params, type, path);
			
			if (parentModal.length > 0) {
				main.renderElementsList(parentModal.find(".elements"), "", parentModal.attr("data-path"));
				main.renderElementsList(parentModal.find(".handlers"), "Handlers", parentModal.attr("data-path"));

			} else if (type == "Process") {
				main.renderElementsList($(selectors.processList), "Process", "");

			} else if (type == "Operation") {
				path = main.pathPop(path);
				main.renderElementsList($(selectors.operationsList), "Operation", path);
			} else if (type == "CommonHandler") {
				main.renderElementsList($(selectors.handlersList), "CommonHandler", "");
			} else if (type == "PyFiles") {
				main.renderElementsList($(selectors.pyFilesList), "PyFiles", "");
			}

			closeModal(modal);
		}
	}
}