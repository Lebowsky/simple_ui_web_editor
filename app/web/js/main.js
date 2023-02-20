$(document).ready(function(){
	var main = Object.create(Main);

	main.conf = $.parseJSON($(".hidden-conf-json").text());
	main.renderConfiguration();

	$(document).on('click', '#processes option', function(){
		main.renderProcessesParams($(this).val())
	});

	$(document).on('click', '#screen option', function(){
		main.renderOperationParam($('#processes').val(), $(this).val())
	});

	$("#screen-conf button").click(function(){
		let tabID = "#"+$(this).data("tab-id");
		$(".screen-section-wrap").removeClass("active");
		$(tabID).addClass("active");
	});

	$(document).on('click', '#screen-elements option', function(){
		let processIndex = $("#processes").val(),
			screenIndex = $("#screen").val();

		var modal = addModal("", $(this).val());
		main.renderElementParam(modal, $(this).val(), processIndex, screenIndex, $(this).val());
	});

	$(document).on('click', '.layout-elements option', function(){
		let processIndex = $("#processes").val(),
			screenIndex = $("#screen").val(),
			path = String($(this).parent(".layout-elements").data("layout-index")) + "-" + $(this).val();

		var modal = addModal("element-modal", path);
		main.renderElementParam(modal, $(this).val(), processIndex, screenIndex, path);
	});

	$(document).on('click', '.save-element', function(){
		let modalNode = $(this).parents(".modal"),
			processIndex = $("#processes").val(),
			screenIndex = $("#screen").val(),
			path = modalNode.data("path");

		main.saveElement(modalNode, processIndex, screenIndex, path);
		closeModal($(this).parents(".modal"));
	});

	$(document).on('click', '.close-modal', function(){
		closeModal($(this).parents(".modal"));
	});

	$(document).on('change', '.form.configuration :input', function(){
		let parentNode = $(this).parents(".form"),
			processIndex = parentNode.data("process-index"),
			screenIndex = parentNode.data("screen-index");

		if (typeof processIndex == "undefined") {
			processIndex = false;
		}
		if (typeof screenIndex == "undefined") {
			screenIndex = false;
		}

		main.saveElement(parentNode, processIndex, screenIndex);
		//closeModal($(this).parents(".modal"));
	});
});

function addModal (className, path = "") {
	let processIndex = $("#processes").val(),
		operationIndex = $("#screen").val();

	$("#modals-wrap").addClass("active");
	modal = $("<div class='modal "+className+"' data-path='"+path+"' data-process='"+processIndex+"' data-operation='"+operationIndex+"'></div>").appendTo("#modals-wrap");

	return modal;
}

function closeModal (modalNode) {
	if (modalNode.siblings(".modal").length == 0) {
		modalNode.parents("#modals-wrap").removeClass("active");
	}
	modalNode.remove();
}

var Main = {
	conf: {},
	saveElement: function (modalNode, processIndex = false, operationIndex = false, path = false) {
		let element = this.getElementByPath(processIndex, operationIndex, path);
		params = this.getParamValue(modalNode);

		$.each(element, function(paramName, paramValue) {
			if (typeof params[paramName] != "undefined")
				element[paramName] = params[paramName];
		});

		this.updateConfig();

		console.log(this.conf);
	},
	updateConfig: function () {
		let confJson = JSON.stringify(this.conf);
		$(".hidden-conf-json").text(confJson);
	},
	getParamValue: function (formNode) {
		params = {};
		paramsNodes = formNode.find("[data-param-name]");

		for (var i = 0; i < paramsNodes.length; i++) {
			paramName = $(paramsNodes[i]).data("param-name");
			paramValue = $(paramsNodes[i]).val();

			params[paramName] = paramValue;
		}

		return params;
	},
	getElementByPath: function (processIndex, operationIndex, path) {
		let configuration   = this.conf.ClientConfiguration,
			processes       = configuration.Processes,
			processParams   = processes[processIndex],
			operations      = processParams.Operations,
			operationParams = operations[operationIndex],
			element         = operationParams,
			arrPath         = String(path).split("-");

		for (var i = 0; i < arrPath.length; i++) {
			element = element.Elements[arrPath[i]];
		}

		return element;
	},
	renderConfiguration: function () {
		let configuration  = this.conf.ClientConfiguration,
			processes      = configuration.Processes,
			processOptions = {};

		$(configurationParams.ConfigurationName).val(configuration.ConfigurationName);

		$.each(configuration, function(confParamName, confParamValue){
			if (typeof confParamValue !== 'object') {
				inputNode = $("#"+confParamName);

				if (inputNode.length > 0) {
					inputNode.val(confParamValue);
				}
			}
		})

		processes.forEach((processParams, procesIndex) => {
			let processName = processParams.ProcessName;

			if (typeof processName !== 'undefined')
				processOptions[procesIndex] = processName
		});

		this.renderSelectOptions(configurationParams.Processes, processOptions);
	},
	renderProcessesParams: function (processIndex = 0) {
		processes      = this.conf.ClientConfiguration.Processes;
		processParams  = processes[processIndex];
		operations     = processParams.Operations;
		operationssOptions = {};
		
		Main.clearParams("Process");

		$.each(configurationParams.Process, function(processParamName, processNodeSelector){
			fieldValue = processParams[processParamName];
			Main.renderParamValue(fieldValue, processNodeSelector);
		});

		operations.forEach((operationParams, operationIndex) => {
			let operationName = operationParams.Name;

			if (typeof operationName !== 'undefined')
				operationssOptions[operationIndex] = operationName
		});

		this.renderSelectOptions(configurationParams.Operations, operationssOptions);
	},
	renderOperationParam: function (processIndex = 0, operationIndex = 0) {
		processes       = this.conf.ClientConfiguration.Processes;
		processParams   = processes[processIndex];
		operations      = processParams.Operations;
		operationParams = operations[operationIndex];
		elemnts         = operationParams.Elements;
		elementssOptions = {};
		
		Main.clearParams("Operation");

		$.each(configurationParams.Operation, function(operationParamName, operationParamSelector){
			fieldValue = operationParams[operationParamName];
			Main.renderParamValue(fieldValue, operationParamSelector);
		});

		elemnts.forEach((elemetParams, elemetIndex) => {
			let elemetType = elemetParams.type;

			if (typeof elemetType !== 'undefined')
				elementssOptions[elemetIndex] = elemetType
		});

		this.renderSelectOptions(configurationParams.ScreenElements, elementssOptions);
	},
	renderElementParam: function (modal, elementIndex = 0, processIndex = 0, operationIndex = 0, path = "0") {
		let html    = "<div class='close-modal'><i class='fa fa-times' aria-hidden='true'></i></div><div class='form'>",
			element = this.getElementByPath(processIndex, operationIndex, path);

		$.each(element, function(elemntParamName, elemntParamValue){
			if (typeof confElementParams[elemntParamName] !== 'undefined') {
				if (confElementParams[elemntParamName]["type"] == "text") {
					html += "<label>"+elemntParamName+"</label><input data-param-name='"+elemntParamName+"' type='text' value='"+elemntParamValue+"'>";
				}
				if (confElementParams[elemntParamName]["type"] == "select") {
					html += "<label>"+elemntParamName+"</label><select data-param-name='"+elemntParamName+"' name='"+elemntParamName+"'>";

					$.each(confElementParams[elemntParamName]["options"], function(optionIndex, option) {
						html += "<option value='"+option+"' "+(elemntParamValue == option ? 'selected' : '')+">"+option+"</option>";
					});

					html += "</select>";
				}
			}
		});

		html += "</div>";

		if (element["type"] == "LinearLayout") {
			var layuotElements = element.Elements,
				layuotElementssOptions = {};

			html += "<div class='btn-group'>";

			$.each(confElementParams["layoutButtons"]["buttons"], function(buttonIndex, buttonParam) {
				html += "<button class='"+buttonParam.class+"'>"+buttonParam.text+"</button>";
			});

			html += "</div>";
			html += '<select name="elements" class="layout-elements" data-layout-index="'+path+'" size="7">';

			layuotElements.forEach((elemetParams, elemetIndex) => {
				let elemetType = elemetParams.type;

				if (typeof elemetType !== 'undefined')
					layuotElementssOptions[elemetIndex] = elemetType
			});

			html += '</select>';
		}

		html += "<div class='btn-group'><button class='save-element'>Save</button></div>"

		modal.html(html);
		if (typeof layuotElementssOptions !== 'undefined') {
			this.renderSelectOptions(configurationParams.LayoutElements, layuotElementssOptions, modal);
		}
	},
	renderSelectOptions: function (selectID, options, parentNode = false) {
		if (parentNode) {
			selectNode = parentNode.find(selectID);
		} else {
			selectNode = $(document).find(selectID);
		}

		selectNode.html("");
		$.each(options, function(optionValue, optionName){
			selectNode.append("<option value='"+optionValue+"'>"+optionName+"</option>");
		});
	},
	clearParams: function (params) {
		$.each(configurationParams[params], function(paramName, paramSelector){
			Main.renderParamValue("", paramSelector);
		});
	},
	renderParamValue: function (paramValue, paramSelector) {
		if (typeof paramValue !== 'undefined') {
			if (paramValue == "") {
				if ($(paramSelector).attr("type") == "checkbox")
					$(paramSelector).prop('checked', false);

				if ($(paramSelector).attr("type") == "text") 
					$(paramSelector).val("");
			} else {
				if (paramValue === true) {
					$(paramSelector).prop('checked', true);
				} else if (paramValue === false) {
					$(paramSelector).prop('checked', false);
				} else {
					$(paramSelector).val(paramValue);
				}	
			}
		}
	}
}

function addSelect (selectID, optionText) {
	//$("body").find("#"+selectID).append("<option value='#'>"+optionText+"</option>");

	if (selectID == "processes") {
		index = $("#"+selectID+" option").length - 1;
		renderProcessesSelect(optionText, index, "selected");
	}
}

function renderAddElementModal (modalNode) {
	modalNode.find(".element-params").remove();
	modalNode.append("<label for='element-type'>Type:</label><select class='element-type'></select>");

	$.each(elementParams.type.options, function(optionIndex, option){
		modalNode.find(".element-type").append("<option value='"+option+"'>"+option+"</option>");
	});

	modalNode.append("<div class='element-params'></div>");

	element = modalNode.find(".element-type").val();

	renderElementParams(modalNode, element);
}

function renderElementParams (modalNode, elementType) {
	let html = "",
		elementParamsList = elements[elementType];

	$.each(elementParamsList, function(index, param) {
		if (elementParams[param]["type"] == "text") {
			html += "<label>"+param+"</label><input type='text'>";
		}
		if (elementParams[param]["type"] == "select") {
			html += "<label>"+param+"</label><select name='"+param+"'>";

			$.each(elementParams[param]["options"], function(optionIndex, option) {
				html += "<option value='"+option+"'>"+option+"</option>";
			});

			html += "</select>";
		}
		if (elementParams[param]["type"] == "buttons") {
			html += "<div class='btn-group'>";

			$.each(elementParams[param]["buttons"], function(buttonIndex, buttonParam) {
				html += "<button class='"+buttonParam.class+"'>"+buttonParam.text+"</button>";
			});

			html += "</div>";
		}
	});

	modalNode.find(".element-params").html(html);
}

/*function addProcess (processParams) {
	//$.parseJSON(processParams);
	console.log(ClientConfiguration);
}*/

/*function renderConfiguration(configuration) {
	var conf = configuration.ClientConfiguration;

	$.each(conf, function(confParamName, confParamValue){
		if (typeof confParamValue !== 'object') {
			inputNode = $("#"+confParamName);

			if (inputNode.length > 0) {
				inputNode.val(confParamValue);
			}
			//console.log(confParamName + ': ' + confParamValue);
		} else {
			//$.each(confParamValue, function(paramName, paramValue){
				//console.log(confParamValue);
			//});
		}
	});
}*/

/*function renderConfiguration (configuration) {
	let conf = configuration.ClientConfiguration,
		processes = conf.Processes;

	$(configurationParams.ConfigurationName).val(conf.ConfigurationName);

	processes.forEach((processObj, procesIndex) => {
		let processParams = processObj,
			selected = "";

		if (procesIndex == 0)
			selected = "selected";

		if (typeof processParams.ProcessName !== 'undefined')
			$("#processes").append("<option "+selected+" value='"+procesIndex+"'>"+processParams.ProcessName+"</option>");
	});

	//renderProcessesParams(processes, 0);
}*/

/*function renderProcessesParams (processes, processIndex) {
	let processParams = processes[processIndex];

	$.each(configurationParams.Process, function(processParamName, processNodeSelector){
		fieldValue = processParams[processParamName];
		renderParamValue(fieldValue, processNodeSelector);
	});
}*/

/*function renderParamValue (paramValue, paramSelector) {
	if (typeof paramValue !== 'undefined') {
		if (paramValue === true) {
			$(paramSelector).attr("checked", "");
		} else if (paramValue === false) {
			$(paramSelector).removeAttr("checked");
		} else {
			$(paramSelector).val(paramValue);
		}
	}
}*/