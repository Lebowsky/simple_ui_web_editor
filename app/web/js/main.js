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
		} else if (type == "PyFiles") {
			nameProp = "PyFileKey";
			elements = elementInfo.parent.PyFiles;
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

			if (type == "PyFiles")
				elementType = "PyFiles";

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

		$.each(elementParams[type], function (configName, paramFields) {
			if (paramFields["type"] != "operations") {
				value = "";
				if (paramFields["type"] == "elements" || paramFields["type"] == "handlers") {
					html += '<div class="param list-param">';
			  } else {
					html += '<div class="param">';
				}

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

					html += '<div><label for="'+configName+'">'+paramFields["text"]+'</label>';
					html += '<input type="checkbox" name="'+configName+'" id="'+configName+'" data-param-name="'+configName+'" '+value+'></div>';
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
							
							html += '<select data-param-name="'+configName+'" class="element-type">';	

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
	modal = $("<div class='modal "+className+"' data-type='"+type+"' data-parent-type='"+parentType+"' data-path='"+path+"'><div class='close-modal'><i class='fa fa-times' aria-hidden='true'></i></div><div class='modal-head'><h2 class='modal-title'>"+modalTitle+"</h2><span class='path'>"+modalPath+"</span></div><div class='modal-content'></div></div>").appendTo("#modals-wrap");
	$('.content').addClass("blur");

	$("body").addClass("no-scroll");

	return modal;
}

function closeModal (modalNode) {
	if (modalNode.siblings(selectors.modal).length == 0) {
		modalNode.parents("#modals-wrap").removeClass("active");
	}

	modalNode.remove();
	
	if ($(".modal").length == 0)
		$("body").removeClass("no-scroll");
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