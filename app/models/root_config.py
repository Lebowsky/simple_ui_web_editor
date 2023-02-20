from typing import List, Optional, Union
import uuid
from enum import Enum

from pydantic import BaseModel, Field, validator

from config import su_settings
from models.elements import BaseElement, RootContainer


class CVDetectorType(str, Enum):
    barcode: str = 'Barcode'
    ocr: str = 'OCR'
    objects_full: str = 'Objects_Full'
    objects_ocr: str = 'Objects_OCR'
    objects_barcode: str = 'Objects_Barcode'
    objects_f1: str = 'Objects_f1'


class BaseConfigModel(BaseModel):
    class Config:
        allow_population_by_field_name = True
        use_enum_values = True


class MainMenuModel(BaseConfigModel):
    menu_id: str = Field(default='', alias='MenuId')
    menu_item: str = Field(default='', alias='MenuItem')
    menu_title: str = Field(default='', alias='MenuTitle')
    menu_top: bool = Field(default=False, alias='MenuTop')


class MediaFileModel(BaseConfigModel):
    media_file_data: str = Field(default='', alias='MediafileData')
    media_file_ext: str = Field(default='', alias='MediafileExt')
    media_file_key: str = Field(default='', alias='MediafileKey')  # media


class SQLQueryModel(BaseConfigModel):
    Query: str


class PyTimerTaskModel(BaseConfigModel):
    py_timer_task_key: str = Field(default='', alias='PyTimerTaskKey')
    py_timer_task_def: str = Field(default='', alias='PyTimerTaskDef')
    py_timer_task_period: str = Field(default='0', alias='PyTimerTaskPeriod')
    py_timer_task_build_in: bool = Field(default=False, alias='PyTimerTaskBuilIn')

    @validator('py_timer_task_period')
    def check_int_value(cls, v):
        try:
            int(v)
        except Exception:
            raise ValueError('Value must be int')
        return v


class PyFilesModel(BaseConfigModel):
    py_file_key: str = Field(alias='PyFileKey')
    py_file_data: str = Field(alias='PyFileData')


class ConfigurationSettingsModel(BaseConfigModel):
    uid: str = uuid.uuid4().hex
    vendor: str = ''
    vendor_url: str = ''
    vendor_auth: str = ''
    handler_split_mode: bool = False
    handler_code: str = ''
    handler_url: str = ''
    handler_auth: str = ''
    dictionaries: str = ''


class OperationsModel(BaseConfigModel):
    type: str = 'Operation'
    name: str = Field(default=su_settings.locale.get('new_screen'), alias='Name')
    timer: bool = Field(default=False, alias='Timer')
    hide_toolbar_screen: bool = Field(default=False, alias='hideToolBarScreen')
    no_scroll: bool = Field(default=False, alias='noScroll')
    online_on_after_start: Optional[bool] = Field(default=False, alias='onlineOnAfterStart')
    handle_key_up: bool = Field(default=False, alias='handleKeyUp')
    no_confirmation: bool = Field(default=False, alias='noConfirmation')
    hide_bottom_bar_screen: bool = Field(default=False, alias='hideBottomBarScreen')
    online_on_start: bool = Field(default=False, alias='onlineOnStart')
    send_when_opened: bool = False
    send_after_opened: Optional[bool] = False
    online_on_input: bool = Field(default=False, alias='onlineOnInput')
    def_online_on_create: str = Field(default='', alias='DefOnlineOnCreate')
    def_online_on_input: str = Field(default='', alias='DefOnlineOnInput')
    def_on_create: str = Field(default='', alias='DefOnCreate')
    def_on_input: str = Field(default='', alias='DefOnInput')
    elements: List[Union[RootContainer, BaseElement]] = Field(default=[], alias='Elements')

    @validator('elements', pre=False)
    def change_type_element(cls, v, values, **kwargs):
        for index, item in enumerate(v):
            if getattr(item, 'type', '') != 'LinearLayout':
                v[index] = BaseElement(**item.dict(by_alias=True))
        return v


class CVFrames(BaseConfigModel):
    name: str = Field(alias='Name')
    type: str = Field(default='CVFrame')
    cv_online: bool = Field(default=False, alias='CVOnline')
    cv_detector: CVDetectorType = Field(default='', alias='CVDetector')
    cv_resolution: str = Field(default='', alias='CVResolution')  # HD1080
    cv_mode: str = Field(default='', alias='CVMode')  # list_only
    cv_action_buttons: str = Field(default='', alias='CVActionButtons')
    cv_action: str = Field(default='', alias='CVAction')  # Title
    cv_info: str = Field(default='', alias='CVInfo')
    cv_camera_device: str = Field(default='', alias='CVCameraDevice')  # "Back"/Front,
    cv_detector_mode: str = Field(default='', alias='CVDetectorMode')  # "train"/predict,
    cv_frame_online_on_create: str = Field(default='', alias='CVFrameOnlineOnCreate')
    cv_frame_def_on_create: str = Field(default='', alias='CVFrameDefOnCreate')
    cv_frame_online_on_new_object: str = Field(default='', alias='CVFrameOnlineOnNewObject')
    cv_frame_def_on_new_object: str = Field(default='', alias='CVFrameDefOnNewObject')
    cv_frame_def_on_touch = Field(default='', alias='CVFrameDefOnTouch')
    cv_frame_online_on_touch: str = Field(default='', alias='CVFrameOnlineOnTouch')
    cv_frame_online_action: str = Field(default='', alias='CVFrameOnlineAction')
    cv_frame_def_action = Field(default='', alias='CVFrameDefAction')


class CVOperationModel(BaseConfigModel):
    name: str = Field(alias='CVOperationName')
    type: str = 'CVOperation'
    cv_frames: List[CVFrames] = Field(default=[], alias='CVFrames')


class ProcessesModel(BaseConfigModel):
    type: str = 'Process'
    process_name: str = Field(default=su_settings.locale.get('new_process'), alias='ProcessName')
    plan_fact_header: str = Field(default=su_settings.locale.get('plan_fact'), alias='PlanFactHeader')
    define_on_back_pressed: bool = Field(default=False, alias='DefineOnBackPressed')
    hidden: bool = False
    login_screen: bool = False
    sc: bool = Field(default=False, alias='SC')
    operations: List[OperationsModel] = Field(alias='Operations')


class QRCodeConfig(BaseModel):
    raw_url: str = Field(alias='RawConfigurationURL')
    raw_service_auth: str = Field(default='', alias='RawConfigurationServiceAuth')
    raw_service_on: bool = Field(default=True, alias='RawConfigurationServiceON')
    online_split_mode: bool = Field(default=True, alias='OnlineSplitMode')


class ClientConfigurationModel(BaseConfigModel):
    name: str = Field(
        default=su_settings.locale.get('new_configuration'),
        alias='ConfigurationName')

    description: str = Field(
        default=su_settings.locale.get('new_configuration_decription'),
        alias='ConfigurationDescription')

    version: str = Field(default='0.0.1', alias='ConfigurationVersion')

    processes: List[Union[ProcessesModel, CVOperationModel]] = Field(
        default=[ProcessesModel(Operations=[OperationsModel()])],
        alias='Processes')

    settings: ConfigurationSettingsModel = Field(
        default=ConfigurationSettingsModel(),
        alias='ConfigurationSettings')

    tags: str = Field(default='', alias='ConfigurationTags')
    broadcast_intent: Optional[str] = Field(alias='BroadcastIntent')
    broadcast_variable: Optional[str] = Field(alias='BroadcastVariable')
    face_recognition_url: Optional[str] = Field(alias='FaceRecognitionURL')
    foreground_service: Optional[bool] = Field(alias='ForegroundService')
    on_keyboard_main: Optional[bool] = Field(alias='OnKeyboardMain')
    stop_foreground_service_on_exit: Optional[bool] = Field(alias='StopForegroundServiceOnExit')
    run_python: Optional[bool] = Field(default=True, alias='RunPython')
    def_service_configuration: str = Field(default='', alias='DefServiceConfiguration')
    launch: str = Field(default='', alias='Launch')  # Tiles
    launch_process: str = Field(default='', alias='LaunchProcess')  # process
    launch_var: str = Field(default='', alias='LaunchVar')  # field
    main_menu: List[MainMenuModel] = Field(default=[], alias='MainMenu')
    media_file: List[MediaFileModel] = Field(default=[], alias='Mediafile')
    offline_on_create: List[SQLQueryModel] = Field(default=[], alias='OfflineOnCreate')
    online_service_configuration: str = Field(default='', alias='OnlineServiceConfiguration')
    py_handlers: str = Field(default='', alias='PyHandlers')
    PyTimerTask: List[PyTimerTaskModel] = Field(default=[], alias='PyTimerTask')
    PyFiles: List[PyFilesModel] = Field(default=[], alias='PyFiles')


class RootConfigModel(BaseConfigModel):
    client_configuration: ClientConfigurationModel = Field(default=ClientConfigurationModel(),
                                                           alias='ClientConfiguration')
