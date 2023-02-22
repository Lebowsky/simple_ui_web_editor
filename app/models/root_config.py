from typing import List, Optional, Union
from typing_extensions import Annotated
import uuid

from pydantic import BaseModel, Field, validator

from config import su_settings
# from models.elements import BaseElement
from models.elements import Barcode, HorizontalGallery, Voice, Photo, PhotoGallery, \
    Signature, Vision, Cart, ImageSlider, MenuItem
from models.enums import CVDetectorType
from models.containers import Container, Tiles


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
    vendor: Optional[str]
    vendor_url: Optional[str]
    vendor_auth: Optional[str]
    handler_split_mode: Optional[bool]
    handler_code: Optional[str]
    handler_url: Optional[str]
    handler_auth: Optional[str]
    dictionaries: Optional[str]


Element = Annotated[
    Union[
        Container,
        Tiles,
        Barcode,
        HorizontalGallery,
        Voice,
        Photo,
        PhotoGallery,
        Signature,
        Vision,
        Cart,
        ImageSlider,
        MenuItem

    ], Field(discriminator='type')
]


class OperationsModel(BaseConfigModel):
    type: str = 'Operation'
    name: str = Field(default=su_settings.locale.get('new_screen'), alias='Name')
    timer: bool = Field(default=False, alias='Timer')
    hide_toolbar_screen: bool = Field(default=False, alias='hideToolBarScreen')
    no_scroll: bool = Field(default=False, alias='noScroll')
    online_on_after_start: Optional[bool] = Field(alias='onlineOnAfterStart')
    handle_key_up: bool = Field(default=False, alias='handleKeyUp')
    no_confirmation: Optional[bool] = Field(alias='noConfirmation')
    hide_bottom_bar_screen: bool = Field(default=False, alias='hideBottomBarScreen')
    online_on_start: bool = Field(default=False, alias='onlineOnStart')
    send_when_opened: Optional[bool]
    send_after_opened: Optional[bool]
    online_on_input: bool = Field(default=False, alias='onlineOnInput')
    def_online_on_create: Optional[str] = Field(alias='DefOnlineOnCreate')
    def_online_on_input: Optional[str] = Field(alias='DefOnlineOnInput')
    def_on_create: Optional[str] = Field(alias='DefOnCreate')
    def_on_input: Optional[str] = Field(alias='DefOnInput')
    elements: List[Element] = Field(default=[], alias='Elements')


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
    plan_fact_header: Optional[str] = Field(alias='PlanFactHeader')
    define_on_back_pressed: Optional[bool] = Field(alias='DefineOnBackPressed')
    hidden: Optional[bool]
    login_screen: Optional[bool]
    sc: Optional[bool] = Field(alias='SC')
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

    description: Optional[str] = Field(alias='ConfigurationDescription')

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
    run_python: Optional[bool] = Field(alias='RunPython')
    def_service_configuration: Optional[str] = Field(alias='DefServiceConfiguration')
    launch: Optional[str] = Field(alias='Launch')  # Tiles
    launch_process: Optional[str] = Field(alias='LaunchProcess')  # process
    launch_var: Optional[str] = Field(alias='LaunchVar')  # field
    main_menu: Optional[List[MainMenuModel]] = Field(alias='MainMenu')
    media_file: Optional[List[MediaFileModel]] = Field(alias='Mediafile')
    offline_on_create: Optional[List[SQLQueryModel]] = Field(alias='OfflineOnCreate')
    online_service_configuration: Optional[str] = Field(alias='OnlineServiceConfiguration')
    py_handlers: Optional[str] = Field(alias='PyHandlers')
    py_timer_task: Optional[List[PyTimerTaskModel]] = Field(alias='PyTimerTask')
    py_files: Optional[List[PyFilesModel]] = Field(alias='PyFiles')
    arch2: Optional[bool]


class RootConfigModel(BaseConfigModel):
    client_configuration: ClientConfigurationModel = Field(default=ClientConfigurationModel(),
                                                           alias='ClientConfiguration')
