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