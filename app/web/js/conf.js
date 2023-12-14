const selectors = {
        processList: "#processes",
        operationsList: "#operations",
        CVFramesList: "#cvframes",
        commonHandlers: '#common-handlers',
        handlersList: "#handlers",
        pyFilesList: "#py-files",
        mediaFiles: '#media-files',
        shedulers: '#shedulers',
        styles: '#styles',
        mainMenuList: "#main-menu",
        listWrap: ".list-wrap",
        list: ".list",
        listItem: ".list-item",
        btnEdit: ".edit",
        btnJson: ".json",
        btnDelete: ".delete",
        btnSave: ".save-element",
        btnAdd: ".btn-add",
        btnCopy: ".copy",
        btnPaste: ".btn-paste",
        btnDuplicate: ".duplicate",
        btnCloseModal: ".close-modal",
        modal: ".modal",
        modalTitle: ".modal",
        modalContent: ".modal-content",
};

var keys = {
	"27" : 'closeModal', // Esc
	"ctrl+13" : 'saveElementModal', // Ctrl+Enter
        "ctrl+83" : 'fileLocationSave', // Ctrl+S
}

const newElements = {
        CVOperations: {
                type: "CVOperation",
                CVOperationName: "New CVOperation",
                hidden: false,
                CVFrames: []
        },
        CVFrames: {
                type: "CVFrame",
                Name: "New CVFrame",
                CVAction: "",
                CVActionButtons: "",
                CVCameraDevice: "",
                CVDetector: "",
                CVInfo: "",
                CVMode: "",
                CVOnline: false,
                CVResolution: "",
        },
        Processes: {
                type: "Process",
                ProcessName: "New Process",
                PlanFactHeader: "",
                DefineOnBackPressed: false,
                hidden: false,
                login_screen: false,
                SC: false,
                Operations: []
        },
        Operations: {
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
        CommonHandlers: {
                type: "CommonHandlers",
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
        },
        Mediafile: {
                type: "Mediafile",
                MediafileData: 'New media file',
                MediafileExt: '',
                MediafileKey: ''
        },
        StyleTemplates: {
                type: 'StyleTemplates',
                BackgroundColor: '',
                Padding: '',
                StrokeWidth: '',
                TextBold: '',
                TextColor: '',
                TextItalic: '',
                TextSize: '',
                gravity_horizontal: '',
                gravity_vertical: '',
                height: '',
                name: 'New style',
                orientation: '',
                weight: '',
                width: '',
        },
        PyTimerTask: {
                type: 'PyTimerTask',
                PyTimerTaskBuilIn: '',
                PyTimerTaskDef: 'New shedule',
                PyTimerTaskKey: '',
                PyTimerTaskPeriod: ''
        },
        MainMenu: {
                type: 'MainMenu',
                MenuId: '',
                MenuItem: '',
                MenuTitle: 'New menu',
                MenuTop: ''
        }
}

const constants = {
        'pyHandlersEmptyPath': '<Not selected>'
}

const listElements = {
        CVOperations: {
                node: selectors.processList,
                type: 'CVOperation',
                parentType: 'Processes',
                path: '',
                rowKeys: ['CVOperationName']
        },
        Processes: {
                node: selectors.processList,
                type: 'Process',
                parentType: 'Processes',
                path: '',
                rowKeys: ['ProcessName', 'CVOperationName']
        },
        CommonHandlers: {
                node: selectors.commonHandlers,
                type: 'CommonHandler',
                parentType: 'CommonHandlers',
                path: '',
                rowKeys: ['event']
        },
        PyFiles: {
                node: selectors.pyFilesList,
                type: 'PyFile',
                parentType: 'PyFiles',
                path: '',
                rowKeys: ['PyFileKey']
        },
        MainMenu: {
                node: selectors.mainMenuList,
                type: 'MainMenu',
                parentType: 'MainMenu',
                path: '',
                rowKeys: ['MenuTitle']
        },
        Operations: {
                node: selectors.operationsList,
                type: 'Operation',
                parentType: 'Operations',
                path: '',
                rowKeys: ['Name'],
        },
        Mediafile: {
                node: selectors.mediaFiles,
                type: 'Mediafile',
                parentType: 'Mediafile',
                path: '',
                rowKeys: ['MediafileKey']
        },
        StyleTemplates:{
                node: selectors.styles,
                type: 'StyleTemplate',
                parentType: 'StyleTemplates',
                path: '',
                rowKeys: ['name']        
        },
        PyTimerTask:{
                node: selectors.shedulers,
                type: 'PyTimerTask',
                parentType: 'PyTimerTask',
                path: '',
                rowKeys: ['PyTimerTaskDef']
        },
        CVFrames: {
                node: selectors.CVFramesList,
                type: 'CVFrame',
                parentType: 'CVFrames',
                path: '',
                rowKeys: ['Name'],
        },
        Handlers: {
                node: '.modal.active #handlers',
                type: 'Handler',
                parentType: 'Handlers',
                path: '',
                rowKeys: ['event']
        },
        Elements: {
                node: '.modal.active #elements',
                type: 'Element',
                parentType: 'Elements',
                path: '',
                rowKeys: ['type']
        }
}
