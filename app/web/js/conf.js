const selectors = {
	processList: "#processes",
	operationsList: "#operations",
	handlersList: "#handlers",
    pyFilesList: "#py-files",
	listWrap: ".list-wrap",
	list: ".list",
	listItem: ".list-item",
	btnEdit: ".edit",
	btnDelete: ".delete",
	btnSave: ".save-element",
	btnAdd: ".btn-add",
	btnCloseModal: ".close-modal",
	modal: ".modal",
	modalTitle: ".modal",
	modalContent: ".modal-content",
};

const newElements = {
	Process: {
        type: "Process",
        ProcessName: "New Process",
        PlanFactHeader: "",
        DefineOnBackPressed: false,
        hidden: false,
        login_screen: false,
        SC: false,
        Operations: []
	},
	Operation: {
        type: "Operation",
        Name: "New Screen",
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
	},
	Elements: {
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
	},
	CommonHandler: {
        type: "CommonHandler",
        action: "",
        event: "onLaunch",
        method: "",
        postExecute: "",
        alias: ""
	},
	Handlers: {
        type: "Handlers",
        action: "",
        event: "onLaunch",
        method: "",
        postExecute: "",
	},
        PyFiles: {
                type: "PyFiles",
                PyFileData: '',
                file_path: '',
                PyFileKey: 'Python module'
        }
}

const constants = {
        'pyHandlersEmptyPath': '<Not selected>'
}