const configurationParams = {
	ConfigurationName: "#ConfigurationName",
	Processes: "#processes",
	Operations: "#screen",
	ScreenElements: "#screen-elements",
	LayoutElements: ".layout-elements",
	Operation: {
		Name: "#screen-name",
		Timer: "#screen-timer",
		hideToolBarScreen: "#screen-hidetop",
		noScroll: "#screen-noscroll",
		handleKeyUp: "#screen-handlekeyup",
		noConfirmation: "#screen-noconfirmation",
		hideBottomBarScreen: "#screen-hidebutton",
		/*onlineOnStart: true,
		send_when_opened: true,
		onlineOnInput: true,
		DefOnlineOnCreate: "test_handler_on_start_online",
		DefOnlineOnInput: "test_handler_enter_online",
		DefOnCreate: "test_handler_on_start_python",
		DefOnInput: "test_handler_enter_python",
		onlineOnAfterStart: false*/
	},
	Process: {
		ProcessName: "#process-name",
		PlanFactHeader: "#process-plan-header",
		DefineOnBackPressed: "#processes-DefineOnBackPressed",
		hidden: "#processes-display",
		login_screen: "#processes-run",
		SC: "#processes-indptnt",
	},
	/*Elements: {
        type: "LinearLayout",
        height: "wrap_content",
        width: "wrap_content",
        weight: "0",
        Value: "",
        Variable: "",
        orientation: "vertical",
	}*/
};

const confElements = {
	layout: [
		"value",
		"variable",
		"orientation",
		"layoutButtons",
	],
	barcode: [
		"value",
		"variable",
	],
	Button: [
		"value",
		"variable",
	],
}

const confElementParams = {
	type: {
		type: "select",
		options: [
			"LinearLayout",
			"Barcode",
			"cart",
			"TextView",
			"Button",
		]
	},
	Value: {
		type: "text"
	},
	Variable: {
		type: "text"
	},
	orientation: {
		type: "select",
		options: [
			"vertical",
			"horizontal"
		]
	},
	layoutButtons: {
		type: "buttons",
		buttons: [
			{
				text: "Add New Element",
				class: "add-element",
			},
			{
				text: "Copy Element",
				class: "copy-element",
			}
		]
	},
}

const elementParams = {
	Process: {
		"ProcessName": {
			type: "text",
			text: "Process Name"
		},
		"hidden": {
			type: "checkbox",
			text: "Do not Display in Menu"
		},
		"DefineOnBackPressed": {
			type: "checkbox",
			text: "Override back button"
		},
		"login_screen": {
			type: "checkbox",
			text: "Run at startup"
		},
		"PlanFactHeader": {
			type: "text",
			text: "Plan/Fact Header"
		},
		"SC": {
			type: "checkbox",
			text: "Idependent process"
		}
	},
	Operation: {
		"Name": {
			type: "text",
			text: "Screen name"
		},
		"Timer": {
			type: "checkbox",
			text: "Screen handler on timer"
		},
		"noScroll": {
			type: "checkbox",
			text: "Disble scrolling for Root Layout"
		},
		"hideBottomBarScreen": {
			type: "checkbox",
			text: "Hide button bar"
		},
		"hideToolBarScreen": {
			type: "checkbox",
			text: "Hide top bar"
		},
		"noConfirmation": {
			type: "checkbox",
			text: "Close without confirmation"
		},
		"handleKeyUp": {
			type: "checkbox",
			text: "Attach a keyboard handler"
		},
		"Elements": {
			type: "Elements",
			text: "Elements"
		},
		"Handlers": {
			type: "Handlers",
			text: "Handlers"
		}
	},
	CommonHandlers: {
		"type": {
			type: "select",
			text: "Type",
			class: "type",
			options: [
				"pyton",
				"online",
			]
		},
		"action": {
			type: "select",
			text: "Action",
			class: "action",
			options: [
				"run",
				"runasync",
			]
		},
		"event": {
			type: "select",
			text: "Event",
			class: "event",
			options: [
				"onLaunch",
				"onWebServiceSyncCommand",
			]
		},
		"postExecute": {
			type: "text",
			text: "postExecute"
		},
		"alias": {
			type: "text",
			text: "alias"
		},
	},
	Handlers: {
		"type": {
			type: "select",
			text: "Type",
			class: "type",
			options: [
				"pyton",
				"online",
			]
		},
		"action": {
			type: "select",
			text: "Action",
			class: "action",
			options: [
				"run",
				"runasync",
			]
		},
		"event": {
			type: "select",
			text: "Event",
			class: "event",
			options: [
				"onLaunch",
				"onWebServiceSyncCommand",
				"onPostStart",
				"onInput",
				"onStart",
			]
		},
		"postExecute": {
			type: "text",
			text: "postExecute"
		},
	},
	LinearLayout: {
		"type": {
			type: "select",
			text: "Type",
			class: "element-type",
			options: [
				"LinearLayout",
				"barcode",
			]
		},
		"Value": {
			type: "text",
			text: "Value"
		},
		"Variable": {
			type: "text",
			text: "Variable"
		},
		"orientation": {
			type: "select",
			text: "Orientation",
			options: [
				"vertical",
				"horizontal",
			]
		},
		"Elements": {
			type: "Elements",
			text: "Elements"
		}
	},
	barcode: {
		"type": {
			type: "select",
			text: "Type",
			class: "type",
			options: [
				"LinearLayout",
				"barcode",
			]
		},
		"Value": {
			type: "text",
			text: "Value"
		},
		"Variable": {
			type: "text",
			text: "Variable"
		},
	}
}