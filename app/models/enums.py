from typing import Literal

from enum import Enum


class LaunchType(str, Enum):
    menu: str = 'Menu'
    tiles: str = 'Tiles'
    empty: str = ''


class ElementsIcon(str, Enum):
    forward: str = 'forward'
    backward: str = 'backward'
    run: str = 'run'
    cancel: str = 'cancel'
    edit: str = 'edit'
    picture: str = 'picture'
    info: str = 'info'
    settings: str = 'settings'
    plus: str = 'plus'
    save: str = 'save'
    search: str = 'search'
    send: str = 'send'
    done: str = 'done'


class GravityHorizontalEnum(str, Enum):
    center: str = 'center'
    left: str = "left"
    right: str = 'right'


class GravityVerticalEnum(str, Enum):
    center: str = 'center'
    top: str = "top"
    bottom: str = 'bottom'


class DimensionsType(str, Enum):
    wrap_content: str = 'wrap_content'
    match_parent: str = 'match_parent'


class OrientationType(str, Enum):
    empty_value = ''
    vertical = 'vertical'
    horizontal = 'horizontal'


class CVDetectorType(str, Enum):
    barcode: str = 'Barcode'
    ocr: str = 'OCR'
    objects_full: str = 'Objects_Full'
    objects_ocr: str = 'Objects_OCR'
    objects_barcode: str = 'Objects_Barcode'
    objects_f1: str = 'Objects_f1'
    multiscanner: str = 'multiscanner'


class CVResolution(str, Enum):
    hd_1080: str = "HD1080"
    hd_720: str = 'HD720'
    vga: str = 'VGA'
    qvga: str = 'QVGA'


class CVMode(str, Enum):
    empty: str = ''
    list_only: str = 'list_only'
    green_and_grey: str = 'green_and_grey'
    green_and_red: str = 'green_and_red'
    list_and_grey: str = 'list_and_grey'


class CVCameraDevice(str, Enum):
    empty: str = ''
    train: str = 'Обучение'
    predict: str = 'Предсказание'


class CVDetectorMode(str, Enum):
    empty: str = ''
    rear: str = "Тыловая"
    front: str = 'Фронтальная'


class EventCommonHandlerEnum(str, Enum):
    empty_value: str = ''
    on_launch: str = 'onLaunch'
    on_launch_menu: str = 'onLaunchMenu'
    on_intent_barcode: str = 'onIntentBarcode'
    on_bluetooth_barcode: str = 'onBluetoothBarcode'
    on_background_command: str = 'onBackgroundCommand'
    on_recognition_listener_result: str = 'onRecognitionListenerResult'
    on_intent: str = 'onIntent'
    on_web_service_sync_command: str = 'onWebServiceSyncCommand'
    on_sql_data_change: str = 'onSQLDataChange'
    on_sql_error: str = 'onSQLError'
    on_open_file: str = 'onOpenFile'
    on_handler_error: str = 'onHandlerError'
    on_service_started: str = 'onServiceStarted'


class EventHandlerEnum(str, Enum):
    on_start: str = 'onStart'
    on_post_start: str = 'onPostStart'
    on_input: str = 'onInput'


class EventCVHandlerEnum(str, Enum):
    on_create: str = 'OnCreate'
    on_object_detected: str = 'OnObjectDetected'
    on_touch: str = 'OnTouch'
    on_input: str = 'OnInput'


class ActionHandlerEnum(str, Enum):
    run: str = 'run'
    run_async: str = 'runasync'
    run_progress: str = 'runprogress'


class HandlerType(str, Enum):
    python: str = 'python'
    python_reload: str = 'pythonreload'
    python_args: str = 'pythonargs'
    pythonscript: str = 'pythonscript'
    online: str = 'online'
    http: str = 'http'
    sql: str = 'sql'
    http_worker: str = 'httpworker'
    worker: str = 'worker'
    _set: str = 'set'
