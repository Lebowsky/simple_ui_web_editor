var Main = {
	initUIConf(conf, filePath){
		this.conf = conf;
		this.configGraph = new ClientConfiguration(conf.ClientConfiguration);

		this.clearMainSection();
		this.fillSelectElementsOptions();
		this.fillDefaultValues();
		this.fillConfigSettings();
		this.renderConfiguration();

		this.configGraph.fillListElements();

		$(".file-path").text(filePath);
    	// $('#preview-button').show();

		const pyHandlersPath = getConfParamValue('pyHandlersPath')
		this.conf.ClientConfiguration['pyHandlersPath']
		if (pyHandlersPath){
			$('#py-handlers-file-path').text(pyHandlersPath)
		}else{
			$('#py-handlers-file-path').text(constants.pyHandlersEmptyPath)
		}
		$('#py-handlers-file-path').attr('data-path', pyHandlersPath)

		// this.loadPrev();
	},
	clearMainSection() {
		$(selectors.processList).html("No processes");
		$(selectors.operationsList).html("No operations");
		$(selectors.commonHandlers).html("No handlers");
	},
	fillSelectElementsOptions(){
		$.each(main.elementParams.ClientConfiguration, function(key, value){
			if (value.type == 'select'){
				selectNode = $('#' + key)
				selectNode.empty()
				$.each(value.options, function (index, option) {
					selectNode.append($('<option>', {
						value: option,
						text: option
					}));
				})
			}
		});
	},
	fillDefaultValues() {
		$.each(main.elementParams.ClientConfiguration, function (key, val) {
			el = $('#' + key)
			if (el.length && val.default_value != undefined)
				if (val.type == 'checkbox')
					el.prop('checked', val.default_value)
				else if (val.type == 'text')
					el.val(val.default_value)
		});
	},
	fillConfigSettings(){
		const settings = main.conf.ClientConfiguration.ConfigurationSettings,
			  {vendor_auth: vendorAuth = '', handler_auth: handlerAuth = ''} = settings;

		let vendorLogin = '',
			vendorPassword = '',
			handlersLogin = '',
			handlersPassword = ''

		if (vendorAuth){
			try {
				[vendorLogin = '', vendorPassword = ''] = decodeURIComponent(atob(vendorAuth.split(' ')[1])).split(':');
			}catch(error){
				console.log(error);
			};
		};
		$('#vendor-login').val(vendorLogin);
		$('#vendor-password').val(vendorPassword);

		if (handlerAuth){
			try{
				[handlersLogin = '', handlersPassword = ''] = decodeURIComponent(atob(handlerAuth.split(' ')[1])).split(':');
			}catch(error){
				console.log(error);
			};
		};
		$('#handlers-login').val(handlersLogin);
		$('#handlers-password').val(handlersPassword);
	},
	renderConfiguration: function () {
		this.configGraph.fillConfigValues('ClientConfiguration');
	},
	loadPrev() {
		$("#prev .prev-content").html('<div class="preload">Load preview...</div><iframe onload="loadedPrev(this)" id="prev-if" src="http://localhost:5000/prev?' + Date.now() + '"></iframe>');
	},
	events(event) {
		return {
			closeModal: () => {
				modal = ModalWindow.getCurrentModal();
				if (modal)
					modal.close();
			},
			saveElementModal: () => {
				modal = ModalWindow.getCurrentModal();
				if (!modal)
					return

				this.configGraph.setConfigValues(modal.element.id, modal.getValues());
				modal.removeClass('edited');
				modal.close();

				elementId = modal.element.id;
				element = main.configGraph.getElementById(elementId);
				main.configGraph.fillListElementValues(element.parentType, element.parentConfig['node'], element.parentId)
			}
		}[event];
	}
}

class ClientConfiguration {
	constructor(config) {
		this.elements = [];
		this.lastId = 0;
		this.addElementFromDict(config)
	}
	addElementFromDict(element, parentId = 0, parentType = 'ClientConfiguration') {
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
	addElementsFromArray(array, parentId, parentType) {
		array.forEach((value) => {
			this.addElementFromDict(value, parentId, parentType);
		})
	}
	addElement(id = '', parentId, parentType, elementValues) {
		let elementConfig;

		try {
			elementConfig = main.elementParams[elementValues.type] || main.elementParams[listElements[parentType]['type']]
		} catch {
			console.debug(parentType)
		}

		const parentConfig = { ...listElements[parentType] };
		let title = parentConfig && parentConfig.rowKeys && parentConfig.rowKeys.length ? elementValues[parentConfig.rowKeys.filter(key => elementValues[key])[0]] : elementValues['type'];
		title = title || elementValues['type']

		if (parentConfig.type == 'Element') {
			parentConfig.type = elementValues['type'];
		}

		const newElement = {
			id: Number(id),
			parentId: Number(parentId),
			parentType: parentType,
			title: title,
			parentConfig: parentConfig,
			elementConfig: elementConfig,
			elementValues: elementValues
		}
		this.elements.push(newElement);

		return newElement;
	}
	newElement(parentId, parentConfig, elementValues) {
		const parentType = parentConfig['parentType'];

		if (!elementValues)
			elementValues = { ...newElements[parentType] };

		return this.addElement(this.getNewId(), parentId, parentType, elementValues);
	}
	removeElement(element) {
		const index = this.elements.indexOf(element);
		if (index > -1) {
			this.elements.splice(index, 1);
		}
	}
	getNewId() {
		return ++this.lastId
	}
	getConfig() {
		let firstElement = this.elements.find((el) => el.parentId == 0);
		const clientConfig = {
			[firstElement.parentType]: { ...firstElement.elementValues }
		};

		let addElements = (configLevel, id) => {
			let elements = this.elements.filter((el) => el.parentId == id);
			elements.forEach((element) => {
				let index;
				if (configLevel[element.parentType]) {
					index = configLevel[element.parentType].push({ ...element.elementValues }) - 1;
				} else {
					configLevel[element.parentType] = [{ ...element.elementValues }];
					index = 0;
				}
				if (index != undefined)
					addElements(configLevel[element.parentType][index], element.id);
			})
		}
		addElements(clientConfig[firstElement.parentType], 1);
		return clientConfig
	}
	getElementById(elementId) {
		return this.elements.find((el) => el.id == elementId)
	}
	getElementPath(elementId, path=[]){
		let element = this.getElementById(elementId);
		if (element.title){
			path.unshift(element.title);
			this.getElementPath(element.parentId, path);
		}
		return path.join(' / ');
	}
	getElementChildrensTypes(elementId) {
		const element = this.getElementById(elementId);
		const elementType = element.parentConfig.type;
		const types = Object.entries(main.elementParams)
			.filter((el) => el[1]['type'].find((el) => el['parent'] && el['parent'] == elementType))
			.map((el) => el[0])

		return types;
	}
	setConfigValues(elementId, values) {
		const element = this.getElementById(elementId);
		$.each(values, (name, value) => {
			element.elementValues[name] = value;
		})
	}
	fillConfigValues(type) {
		const element = this.elements.find((element) => element.parentType == type);
		this.fillElementValuesById(element, element.elementValues);
	}
	fillElementValuesById(element, values) {
		$.each(values, (key, value) => {
			if (typeof value == 'object') {
				this.fillElementValuesById(element, value);
			} else {
				const inputNode = $("#" + key);
				if (inputNode.length) {
					typeof value == 'boolean' ? inputNode.prop('checked', value) : inputNode.val(value);
					inputNode.attr('data-id', element.id)
				} else {
					debug(`Property ${key} not filled`);
				}
			}
		})
	}
	fillListElements() {
		Object.entries(listElements).forEach((el) => {
			const [type, values] = el;
			if (values.node) {
				this.fillListElementValues(type, values.node);
			}
		})
	}
	fillListElementsByParent(parentId, node) {
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
		$(node).attr('data-id', elements.length ? elements[0].parentId : 1);
		$(node).html(listElement.render().html);
	}
	fillListElementValues(type, node, parentId = 1) {
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
		listElement.render();

	$(tabNode).parents(".params").find(".param").removeClass("active");
	$(tabNode).parents(".params").find(".param[data-tab="+tabID+"]").addClass("active");
}

function togglePrev () {
	$(".prev-wrap").toggleClass("show");
}
