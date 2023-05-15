var Main = {
	renderConfiguration: function () {
		this.configGraph.fillConfigValues('ClientConfiguration');
	},
	renderListElements: (elements) => {
		$.each(elements, (key, value) => {
			const elementData = main.getElementDataByPath(value.type, value.path)
			const renderParams = {
				...value,
				parentType: key,
				path: value.path,
				items: elementData.parent[key].map(element => {
					return {
						name: element[value.rowKeys.filter(key => element[key])[0]], 
						type: value.type}
				}),
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

		// pathText = this.getElementByPath(type, path).path;

		if (arrTabs.length) {
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

		if (renderElements){
			const elements = {
				'Elements': {
					...listElements['Elements'],
					node: modalNode.find('.elements'),
					path: path
				}	
			}
			this.renderListElements(elements)
		}
			// this.renderElementsList(modalNode.find('.elements'), "Elements", path);

		if (renderHandlers){
			const elements = {
				Handlers: {
					...listElements['Handlers'],
					node: modalNode.find('.handlers'),
					path: path
				}
			}
			this.renderListElements(elements)
		}
			// this.renderElementsList(modalNode.find('.handlers'), "Handlers", path);
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

		const elements = {
			Process: parent.Processes,	
			Operation: parent.Operations,
			CommonHandler: parent.CommonHandlers,
			PyFile: parent.PyFiles,
			Handler: parent.Handlers,
			MainMenu: parent.MainMenu,
			Mediafile: parent.Mediafile,
			StyleTemplate: parent.StyleTemplates,
			PyTimerTask: parent.PyTimerTask
		}[type] || parent.Elements

		elements.splice(elementIndex, 1)
	},
	addElement: function (type, path) {
		const elementInfo = this.getElementByPath(type, path);
		const newElementsJson = JSON.stringify(newElements);
		const newElementsConf = JSON.parse(newElementsJson);
		const newElement = newElementsConf[type];

		const elements = {
			Process: elementInfo.parent.Processes,	
			Operation: elementInfo.parent.Operations,
			CommonHandler: elementInfo.parent.CommonHandlers,
			PyFile: elementInfo.parent.PyFiles,
			Handler: elementInfo.parent.Handlers,
			MainMenu: elementInfo.parent.MainMenu,
			Mediafile: elementInfo.parent.Mediafile,
			StyleTemplate: elementInfo.parent.StyleTemplates,
			PyTimerTask: elementInfo.parent.PyTimerTask
		}[type] || elementInfo.element.Elements

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
			PyFile: {
				...res,
				parent: res.element,
				element: config.PyFiles[mainIndex]
			},
			Handler: {
				...res,
				parent: operationIndex ? config.Processes[mainIndex].Operations[operationIndex] : undefined,
				element: operationIndex ? config.Processes[mainIndex].Operations[operationIndex].Handlers[handlersIndex] : undefined,
			},
			Operation: {
				...res,
				parent: config.Processes[mainIndex],
				element: operationIndex ? config.Processes[mainIndex].Operations[operationIndex] : undefined
			},
			Mediafile: {
				...res,
				parent: res.element,
				element: config.Mediafile[mainIndex]
			},
			StyleTemplate: {
				...res,
				parent: res.element,
				element: config.StyleTemplates ? config.StyleTemplates[mainIndex]: undefined
			},
			PyTimerTask: {
				...res,
				parent: res.element,
				element: config.PyTimerTask ? config.PyTimerTask[mainIndex]	: undefined
			}
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
	$(selectors.commonHandlers).html("No handlers");
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
	const html = `
	<div class='modal ${className}' data-type='${type}' data-parent-type='${parentType}' data-path='${path}'>
		<div class='close-modal'>
			<i class='fa fa-times' aria-hidden='true'></i>
		</div>
		<div class='modal-head'>
			<h2 class='modal-title'>${modalTitle}<span class='edited'>*</span></h2>
			<span class='path'>${modalPath}</span>
		</div>
		<div class='modal-content'></div>
	</div>")
	`
	modal = $(html).appendTo("#modals-wrap");
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

class ClientConfiguration{
	constructor(config){
		this.elements = [];
		this.lastId = 0;
		this.addElementFromDict(config)
	}
	addElementFromDict(element, parentId = 0, parentType = 'ClientConfiguration'){
		const elementValues = {}
		const elementId = this.getNewId()
		$.each(element, (key, value) => {
			if (Array.isArray(value) && value.length)
				this.addElementsFromArray(value, elementId, key);
			else
				elementValues[key] = value
		});
		this.addElement(elementId, parentId, parentType, elementValues)
	}
	addElementsFromArray(array, parentId, parentType){
		array.forEach((value) => {
			this.addElementFromDict(value, parentId, parentType);
		})
	}
	addElement(id='', parentId, parentType, elementValues){
		let elementConfig;

		try{
			elementConfig = main.elementParams[elementValues.type] || main.elementParams[listElements[parentType]['type']]
		}catch{
			console.debug(parentType)
		}

		const parentConfig = {...listElements[parentType]};
		let title = parentConfig && parentConfig.rowKeys && parentConfig.rowKeys.length ? elementValues[parentConfig.rowKeys.filter(key => elementValues[key])[0]] : elementValues['type'];
		title = title || elementValues['type']

		if (parentConfig.type == 'Element'){
			parentConfig.type = elementValues['type'];
		}
		
		const newElement = {
			id: id,
			parentId: parentId,
			parentType: parentType,
			title: title,
			parentConfig: parentConfig,
			elementConfig: elementConfig,
			elementValues: elementValues
		}
		this.elements.push(newElement);

		return newElement;
	}
	newElement(parentId, parentConfig, elementValues){
		const parentType = parentConfig['parentType'];
		
		if (!elementValues)
			elementValues = {...newElements[parentType]};
		
		return this.addElement(this.getNewId(), parentId, parentType, elementValues);
	}
	removeElement(element){
		const index = this.elements.indexOf(element);
		if (index > -1) {
			this.elements.splice(index, 1);	
		}
	}
	getNewId(){
		return ++this.lastId
	}
	getConfig(){
		let firstElement = this.elements.find((el) => el.parentId == 0);
		const clientConfig ={
			[firstElement.parentType]: {...firstElement.elementValues}
		};

		let addElements = (configLevel, id) => {
			let elements = this.elements.filter((el) => el.parentId == id);
			elements.forEach((element) => {
				let index;
				if (configLevel[element.parentType]){
					index = configLevel[element.parentType].push({...element.elementValues})-1;
				}else{
					configLevel[element.parentType] = [{...element.elementValues}];
					index = 0;
				}
				if (index != undefined)
					addElements(configLevel[element.parentType][index], element.id);
			})
		}
		addElements(clientConfig[firstElement.parentType], 1);
		return clientConfig
	}
	getElementById(elementId){
		return this.elements.find((el) => el.id == elementId)
	}
	getElementChildrensTypes(elementId){
		const element = this.getElementById(elementId);
		const elementType = element.parentConfig.type;
		const types = Object.entries(main.elementParams)
			.filter((el) => el[1]['type'].find((el) => el['parent'] && el['parent'] == elementType))
			.map((el) => el[0])

		return types;
	}
	setConfigValues(elementId, values){
		const element = this.getElementById(elementId);
		$.each(values, (name, value) => {
			element.elementValues[name] = value;
		})
	}
	fillConfigValues(type){
		const element = this.elements.find((element) => element.parentType == type);
		this.fillElementValuesById(element, element.elementValues);
	}
	fillElementValuesById(element, values){
		$.each(values, (key, value) => {
			if (typeof value == 'object'){
				this.fillElementValuesById(element, value);
			}else{
				const inputNode = $("#"+key);
				if (inputNode.length) {
					typeof value == 'boolean' ? inputNode.prop('checked', value) : inputNode.val(value);
					inputNode.attr('data-id', element.id)
				}else{
					debug(`Property ${key} not filled`);
				}	
			}
		})	
	}
	fillListElements(){
		Object.entries(listElements).forEach((el) => {
			const [type, values] = el;
			if (values.node){
				this.fillListElementValues(type, values.node);
			}
		})
	}
	fillListElementsByParent(parentId, node){
		const elements = this.elements.filter((element) => element.parentId == parentId);
		const listItems = [];

		elements.forEach((item) => {
			let name = item.elementValues[item.parentConfig.rowKeys.filter(key => item.elementValues[key])[0]];
			name = name || item.elementValues['type'];
			listItems.push({
				name: name,
				id: item.id
			});		
		})

		const listElement = new ListElement(listItems);
		$(node).attr('data-id', elements.length ? elements[0].parentId: 1);
		$(node).html(listElement.render());
	}
	fillListElementValues(type, node, parentId = 1){
		const elements = this.elements.filter((element) => element.parentType == type && element.parentId == parentId);
		const listItems = [];
		
		elements.forEach((item) => {
			let name = item.elementValues[item.parentConfig.rowKeys.filter(key => item.elementValues[key])[0]];
			name = name || item.elementValues['type'];
			listItems.push({
				name: name,
				id: item.id
			});		
		})
		
		const listElement = new ListElement(listItems);
		$(node).attr('data-id', elements.length ? elements[0].parentId: 1);
		$(node).html(listElement.render());
	}
}