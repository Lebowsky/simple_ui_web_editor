from typing import Literal

from enum import Enum


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


class EventCommonHandlerEnum(str, Enum):
    on_launch: str = 'onLaunch'
    on_intent_barcode: str = 'onIntentBarcode'
    on_bluetooth_barcode: str = 'onBluetoothBarcode'
    on_background_command: str = 'onBackgroundCommand'
    on_recognition_listener_result: str = 'onRecognitionListenerResult'
    on_intent: str = 'onIntent'
    on_web_service_sync_command: str = 'onWebServiceSyncCommand'
    on_sql_data_change: str = 'onSQLDataChange'
    on_sql_error: str = 'onSQLError'
    on_open_file: str = 'onOpenFile'


class EventHandlerEnum(str, Enum):
    on_start: str = 'onStart'
    on_post_start: str = 'onPostStart'
    on_input: str = 'onInput'


class ActionHandlerEnum(str, Enum):
    run: str = 'run'
    run_async: str = 'runasync'


class HandlerType(str, Enum):
    python: str = 'python'
    online: str = 'online'
    http: str = 'http'
    sql: str = 'sql'
    http_worker: str = 'httpworker'
    worker: str = 'worker'
    _set: str = 'set'
